<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Klarhed_Woo — WooCommerce integration.
 *
 * When a product is flagged as a KLARHED-product and a paying customer
 * completes checkout, the buyer's account is auto-enrolled by creating
 * a fresh attempt. Guests get a new WP account on the fly.
 *
 * Admin sets which products grant access in the WooCommerce product
 * editor via a "Grant KLARHED access" panel.
 */
class Klarhed_Woo {

    const PRODUCT_META = '_klarhed_grants_access';

    public function __construct() {
        if ( ! class_exists( 'WooCommerce' ) ) return;

        // Product admin UI
        add_action( 'woocommerce_product_options_general_product_data', [ $this, 'render_product_field' ] );
        add_action( 'woocommerce_process_product_meta',                [ $this, 'save_product_field' ] );

        // Enrollment on payment
        add_action( 'woocommerce_order_status_completed',  [ $this, 'enroll_on_order' ] );
        add_action( 'woocommerce_order_status_processing', [ $this, 'enroll_on_order' ] );

        // Checkout — force account creation
        add_filter( 'woocommerce_checkout_registration_required', [ $this, 'force_account_if_klarhed' ] );
    }

    public function render_product_field() {
        woocommerce_wp_checkbox( [
            'id'          => self::PRODUCT_META,
            'label'       => __( 'Giver KLARHED-adgang', 'klarhed' ),
            'description' => __( 'Ved betalt ordre oprettes et nyt KLARHED-gennemløb på kundens konto.', 'klarhed' ),
        ] );
    }

    public function save_product_field( $post_id ) {
        $v = isset( $_POST[ self::PRODUCT_META ] ) ? 'yes' : 'no';
        update_post_meta( $post_id, self::PRODUCT_META, $v );
    }

    public function force_account_if_klarhed( $required ) {
        if ( ! function_exists( 'WC' ) || ! WC()->cart ) return $required;
        foreach ( WC()->cart->get_cart() as $item ) {
            if ( get_post_meta( $item['product_id'], self::PRODUCT_META, true ) === 'yes' ) return true;
        }
        return $required;
    }

    public function enroll_on_order( $order_id ) {
        $order = wc_get_order( $order_id );
        if ( ! $order ) return;

        // Idempotent
        if ( $order->get_meta( '_klarhed_enrolled' ) === 'yes' ) return;

        $grants = false;
        foreach ( $order->get_items() as $item ) {
            if ( get_post_meta( $item->get_product_id(), self::PRODUCT_META, true ) === 'yes' ) {
                $grants = true; break;
            }
        }
        if ( ! $grants ) return;

        $user_id = $order->get_user_id();
        if ( ! $user_id ) {
            $email = $order->get_billing_email();
            $existing = email_exists( $email );
            if ( $existing ) {
                $user_id = (int) $existing;
            } else {
                $user_id = wc_create_new_customer( $email, '', '', [
                    'first_name' => $order->get_billing_first_name(),
                    'last_name'  => $order->get_billing_last_name(),
                ] );
                if ( is_wp_error( $user_id ) ) return;
            }
            $order->set_customer_id( $user_id );
            $order->save();
        }

        // Mark as customer on the KLARHED side and create attempt
        update_user_meta( $user_id, 'klarhed_enrolled', 1 );
        Klarhed_Attempts::create_for_user( $user_id, __( 'Mit første gennemløb', 'klarhed' ) );

        $order->update_meta_data( '_klarhed_enrolled', 'yes' );
        $order->save();

        do_action( 'klarhed/woo/enrolled', $user_id, $order_id );
    }
}
