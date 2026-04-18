<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Klarhed_Emails — transactional email templates.
 *
 * Hooks:
 *  - klarhed/attempt/created  -> welcome mail
 *  - klarhed/lesson/completed -> next-step nudge (once per chapter)
 *  - klarhed/attempt/finished -> certificate mail
 *  - wp-cron weekly            -> reminder for users inactive > 7 days
 */
class Klarhed_Emails {

    const REMINDER_HOOK = 'klarhed_weekly_reminder';

    public function __construct() {
        add_action( 'klarhed/attempt/created',  [ $this, 'send_welcome' ], 10, 2 );
        add_action( 'klarhed/lesson/completed', [ $this, 'send_chapter_nudge' ], 10, 3 );
        add_action( 'klarhed/attempt/finished', [ $this, 'send_certificate' ], 10, 2 );

        add_action( self::REMINDER_HOOK, [ $this, 'send_weekly_reminders' ] );
        add_action( 'wp',                [ $this, 'schedule_cron' ] );
    }

    public function schedule_cron() {
        if ( ! wp_next_scheduled( self::REMINDER_HOOK ) ) {
            wp_schedule_event( strtotime( 'tomorrow 08:00' ), 'weekly', self::REMINDER_HOOK );
        }
    }

    /* ---------------------- templates ---------------------- */

    private function opts() {
        return wp_parse_args( get_option( 'klarhed_settings', [] ), [
            'from_name'      => get_bloginfo( 'name' ),
            'send_reminders' => true,
        ] );
    }

    private function send( $to, $subject, $body_html ) {
        $opts = $this->opts();
        $wrap = $this->wrap( $body_html );
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            sprintf( 'From: %s <%s>', $opts['from_name'], get_option( 'admin_email' ) ),
        ];
        return wp_mail( $to, $subject, $wrap, $headers );
    }

    private function wrap( $body ) {
        $primary = esc_attr( get_option( 'klarhed_settings' )['primary_color'] ?? '#B4E600' );
        $ink     = '#0F2A2A';
        return '<!doctype html><html><body style="margin:0;background:#FDFEFB;font-family:-apple-system,Segoe UI,Arial,sans-serif;color:' . $ink . ';">'
            . '<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px"><tr><td align="center">'
            . '<table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:14px;overflow:hidden;border:1px solid #E3ECEC">'
            . '<tr><td style="padding:28px 32px;border-bottom:4px solid ' . $primary . '">'
            . '<div style="font-family:Georgia,serif;font-size:22px;color:' . $ink . '">Klarhed <span style="color:' . $primary . '">/</span> Lederskab</div>'
            . '</td></tr>'
            . '<tr><td style="padding:32px;line-height:1.6;font-size:15px">' . $body . '</td></tr>'
            . '<tr><td style="padding:20px 32px;border-top:1px solid #E3ECEC;font-size:12px;color:#7C8C8C">'
            . esc_html__( 'Du modtager denne mail, fordi du er tilmeldt KLARHED-forløbet.', 'klarhed' )
            . '</td></tr></table></td></tr></table></body></html>';
    }

    public function send_welcome( $attempt_id, $user_id ) {
        $u = get_userdata( $user_id ); if ( ! $u ) return;
        $url = get_permalink( get_option( 'klarhed_course_page_id' ) ) ?: home_url( '/' );
        $body = sprintf(
            '<h2 style="font-family:Georgia,serif;font-weight:normal;margin:0 0 14px">%s</h2>'
            . '<p>%s</p><p>%s</p>'
            . '<p style="margin:28px 0"><a href="%s" style="background:#B4E600;color:#0F2A2A;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">%s</a></p>'
            . '<p style="color:#7C8C8C;font-size:13px">%s</p>',
            esc_html__( 'Velkommen til KLARHED.', 'klarhed' ),
            esc_html__( 'Jeg er glad for, at du har valgt at starte denne rejse. Du skal ikke lære KLARHED-modellen udenad — du skal leve den.', 'klarhed' ),
            esc_html__( 'Start med at tage baseline-målingen. Den tager 10 minutter og giver os et ærligt udgangspunkt for din udvikling.', 'klarhed' ),
            esc_url( $url ),
            esc_html__( 'Start baseline-måling →', 'klarhed' ),
            esc_html__( 'Mennesket før metoden, mening før mekanik. — Frank Tessin', 'klarhed' )
        );
        $this->send( $u->user_email, __( 'Velkommen til KLARHED', 'klarhed' ), $body );
    }

    public function send_chapter_nudge( $user_id, $chapter_slug, $attempt_id ) {
        $u = get_userdata( $user_id ); if ( ! $u ) return;
        $chapter = Klarhed_Course::find_chapter( $chapter_slug );
        if ( ! $chapter ) return;
        $body = sprintf(
            '<h2 style="font-family:Georgia,serif;font-weight:normal;margin:0 0 14px">%s %s</h2>'
            . '<p>%s</p><p>%s</p>',
            esc_html__( 'Godt arbejde med', 'klarhed' ),
            esc_html( $chapter['name'] ),
            esc_html__( 'Du har afsluttet endnu et kapitel. Tag en pause, mærk efter — og vend tilbage, når du er klar.', 'klarhed' ),
            esc_html__( 'Næste kapitel venter i din arbejdsbog.', 'klarhed' )
        );
        $this->send( $u->user_email, sprintf( __( 'Kapitel gennemført — %s', 'klarhed' ), $chapter['name'] ), $body );
    }

    public function send_certificate( $attempt_id, $user_id ) {
        $u = get_userdata( $user_id ); if ( ! $u ) return;
        $body = sprintf(
            '<h2 style="font-family:Georgia,serif;font-weight:normal;margin:0 0 14px">%s</h2>'
            . '<p>%s</p><p>%s</p>'
            . '<p><em>%s</em></p>',
            esc_html__( 'Du har gennemført KLARHED.', 'klarhed' ),
            esc_html__( 'Otte kapitler. Syv bogstaver. Én praksis. Du har gennemført forløbet — og vigtigere: du har rykket dig.', 'klarhed' ),
            esc_html__( 'Du kan til enhver tid starte et nyt gennemløb og se, hvor langt du er kommet.', 'klarhed' ),
            esc_html__( 'Klarhed er ikke en destination. Det er en praksis. — Frank Tessin', 'klarhed' )
        );
        $this->send( $u->user_email, __( 'Tillykke — KLARHED gennemført', 'klarhed' ), $body );
    }

    public function send_weekly_reminders() {
        $opts = $this->opts();
        if ( empty( $opts['send_reminders'] ) ) return;

        $cutoff = strtotime( '-7 days' );
        $q = new WP_Query( [
            'post_type'      => Klarhed_Attempts::CPT,
            'meta_key'       => Klarhed_Attempts::META_STATUS,
            'meta_value'     => 'active',
            'posts_per_page' => 200,
            'date_query'     => [ [ 'before' => date( 'Y-m-d', $cutoff ), 'column' => 'post_modified' ] ],
        ] );
        foreach ( $q->posts as $p ) {
            $u = get_userdata( $p->post_author ); if ( ! $u ) continue;
            $body = sprintf(
                '<h2 style="font-family:Georgia,serif;font-weight:normal;margin:0 0 14px">%s</h2>'
                . '<p>%s</p><p><a href="%s" style="color:#0F2A2A;border-bottom:2px solid #B4E600">%s</a></p>',
                esc_html__( 'Klar til næste skridt?', 'klarhed' ),
                esc_html__( 'Det er en uge siden, du sidst var i din KLARHED-arbejdsbog. Der ligger et kapitel og venter — 20 minutter er nok.', 'klarhed' ),
                esc_url( home_url( '/kursus/klarhed/' ) ),
                esc_html__( 'Fortsæt hvor du slap →', 'klarhed' )
            );
            $this->send( $u->user_email, __( 'Dit KLARHED-forløb venter', 'klarhed' ), $body );
        }
    }
}
