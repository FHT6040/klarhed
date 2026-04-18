<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Klarhed_Admin {
    public function __construct() {
        add_action( 'admin_menu', [ $this, 'menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
    }

    public function menu() {
        add_menu_page(
            __( 'KLARHED', 'klarhed' ), __( 'KLARHED', 'klarhed' ),
            'manage_options', 'klarhed', [ $this, 'page_overview' ],
            KLARHED_URL . 'assets/img/menu-icon.png', 30
        );
        add_submenu_page( 'klarhed', __( 'Oversigt', 'klarhed' ),   __( 'Oversigt', 'klarhed' ),   'manage_options', 'klarhed',           [ $this, 'page_overview' ] );
        add_submenu_page( 'klarhed', __( 'Kursusindhold', 'klarhed' ), __( 'Kursusindhold', 'klarhed' ), 'manage_options', 'klarhed-content', [ $this, 'page_content' ] );
        add_submenu_page( 'klarhed', __( 'Kursister', 'klarhed' ),  __( 'Kursister', 'klarhed' ),  'manage_options', 'klarhed-students',  [ $this, 'page_students' ] );
        add_submenu_page( 'klarhed', __( 'Shortcodes', 'klarhed' ), __( 'Shortcodes', 'klarhed' ), 'manage_options', 'klarhed-shortcodes', [ $this, 'page_shortcodes' ] );
        add_submenu_page( 'klarhed', __( 'Indstillinger', 'klarhed' ), __( 'Indstillinger', 'klarhed' ), 'manage_options', 'klarhed-settings', [ $this, 'page_settings' ] );
    }

    public function register_settings() {
        register_setting( 'klarhed_settings_group', 'klarhed_settings', [
            'sanitize_callback' => [ $this, 'sanitize_settings' ],
        ] );
    }

    public function sanitize_settings( $input ) {
        $clean = [];
        foreach ( [ 'primary_color' => '#B4E600', 'secondary_color' => '#29C7C7' ] as $key => $default ) {
            $val = isset( $input[ $key ] ) ? $input[ $key ] : $default;
            $clean[ $key ] = preg_match( '/^#[0-9a-fA-F]{6}$/', $val ) ? $val : $default;
        }
        $clean['require_login']  = ! empty( $input['require_login'] );
        $clean['auto_save']      = ! empty( $input['auto_save'] );
        $clean['send_reminders'] = ! empty( $input['send_reminders'] );
        return $clean;
    }

    public function page_overview() {
        $total_users = count_users();
        $total_lessons = Klarhed_Course::total_lessons();
        echo '<div class="wrap klarhed-admin">';
        echo '<h1>' . esc_html__( 'KLARHED — Oversigt', 'klarhed' ) . '</h1>';
        echo '<p>' . esc_html__( 'Fra indsigt til integreret lederskab. Her ser du, hvordan dit forløb bliver brugt.', 'klarhed' ) . '</p>';
        echo '<div class="klarhed-stats"><div class="card"><span>' . esc_html__( 'Aktive kursister', 'klarhed' ) . '</span><b>' . intval( $total_users['total_users'] ) . '</b></div>';
        echo '<div class="card"><span>' . esc_html__( 'Lektioner total', 'klarhed' ) . '</span><b>' . $total_lessons . '</b></div></div>';
        echo '</div>';
    }

    public function page_content() {
        $data = Klarhed_Course::get_data();
        echo '<div class="wrap"><h1>' . esc_html__( 'Kursusindhold', 'klarhed' ) . '</h1><table class="widefat"><thead><tr><th>#</th><th>Modulnavn</th><th>Slug</th><th>Lektioner</th><th>Varighed</th></tr></thead><tbody>';
        foreach ( $data['chapters'] as $c ) {
            printf( '<tr><td>%s</td><td><b>%s</b></td><td><code>%s</code></td><td>%d</td><td>%s</td></tr>',
                esc_html( $c['letter'] ), esc_html( $c['name'] ), esc_html( $c['slug'] ), count( $c['lessons'] ), esc_html( $c['duration'] ) );
        }
        echo '</tbody></table></div>';
    }

    public function page_students() {
        $users = get_users( [ 'fields' => [ 'ID', 'display_name', 'user_email' ] ] );
        echo '<div class="wrap"><h1>' . esc_html__( 'Kursister', 'klarhed' ) . '</h1>';
        echo '<p>' . esc_html__( 'Styr coach-deling pr. bruger her. Når coach-deling er slået fra, kan kursisten ikke generere et delings-link — og eksisterende links bliver tilbagekaldt.', 'klarhed' ) . '</p>';
        echo '<table class="widefat"><thead><tr><th>Navn</th><th>E-mail</th><th>Gennemløb</th><th>Seneste %</th><th>Coach-deling</th><th>Status</th></tr></thead><tbody>';
        foreach ( $users as $u ) {
            $attempts = Klarhed_Attempts::get_for_user( $u->ID );
            $latest   = $attempts ? end( $attempts ) : null;
            $pct      = $latest ? Klarhed_Attempts::completion_pct( $latest ) : 0;
            $allowed  = Klarhed_Shares::admin_allowed( $u->ID );
            $share    = Klarhed_Shares::get( $u->ID );
            $toggle   = sprintf(
                '<label class="klarhed-switch"><input type="checkbox" data-user="%d" class="klarhed-coach-toggle" %s /> <span>%s</span></label>',
                (int) $u->ID, checked( $allowed, true, false ), $allowed ? esc_html__( 'Tilladt', 'klarhed' ) : esc_html__( 'Slået fra', 'klarhed' )
            );
            $status = $share['enabled'] ? sprintf( '<code title="%s">%s…</code>', esc_attr( Klarhed_Shares::public_url( $share['token'] ) ), esc_html( substr( $share['token'], 0, 8 ) ) ) : '—';
            printf( '<tr><td><b>%s</b></td><td>%s</td><td>%d</td><td>%d%%</td><td>%s</td><td>%s</td></tr>',
                esc_html( $u->display_name ), esc_html( $u->user_email ), count( $attempts ), $pct, $toggle, $status );
        }
        echo '</tbody></table>';
        wp_print_inline_script_tag( 'jQuery(function($){$(".klarhed-coach-toggle").on("change",function(){var u=$(this).data("user"),a=$(this).is(":checked");$.ajax({url:wpApiSettings.root+"klarhed/v1/admin/coach-allow",method:"POST",beforeSend:function(x){x.setRequestHeader("X-WP-Nonce",wpApiSettings.nonce)},data:{user_id:u,allow:a?1:0}});});});' );
        echo '</div>';
    }

    public function page_shortcodes() {
        $codes = [
            '[klarhed_course]'       => __( 'Hele kursusvisningen.', 'klarhed' ),
            '[klarhed_baseline]'     => __( 'Kun baseline-målingen.', 'klarhed' ),
            '[klarhed_chapter slug="ambition"]' => __( 'Et enkelt kapitel.', 'klarhed' ),
            '[klarhed_progress]'     => __( 'Fremskridts-widget.', 'klarhed' ),
            '[klarhed_manifest]'     => __( 'Personligt ledelsesmanifest.', 'klarhed' ),
        ];
        echo '<div class="wrap"><h1>' . esc_html__( 'Shortcodes', 'klarhed' ) . '</h1>';
        foreach ( $codes as $c => $d ) echo '<p><code>' . esc_html( $c ) . '</code> — ' . esc_html( $d ) . '</p>';
        echo '</div>';
    }

    public function page_settings() {
        echo '<div class="wrap"><h1>' . esc_html__( 'Indstillinger', 'klarhed' ) . '</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields( 'klarhed_settings_group' );
        $s = get_option( 'klarhed_settings', [] );
        echo '<table class="form-table">';
        echo '<tr><th>Primær farve</th><td><input name="klarhed_settings[primary_color]" value="' . esc_attr( $s['primary_color'] ?? '#B4E600' ) . '" /></td></tr>';
        echo '<tr><th>Sekundær farve</th><td><input name="klarhed_settings[secondary_color]" value="' . esc_attr( $s['secondary_color'] ?? '#29C7C7' ) . '" /></td></tr>';
        echo '<tr><th>Kræv login</th><td><input type="checkbox" name="klarhed_settings[require_login]" value="1" ' . checked( 1, $s['require_login'] ?? 0, false ) . ' /></td></tr>';
        echo '</table>';
        submit_button();
        echo '</form></div>';
    }
}
