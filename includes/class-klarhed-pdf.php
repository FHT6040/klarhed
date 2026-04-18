<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Klarhed_PDF — server-side PDF export of a completed attempt.
 *
 * Uses Dompdf (bundled via Composer) when available, or falls back to
 * a printable HTML view (browser "Save as PDF").
 *
 * Endpoint: GET /wp-json/klarhed/v1/pdf/<attempt_id>
 */
class Klarhed_PDF {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register' ] );
    }

    public function register() {
        register_rest_route( 'klarhed/v1', '/pdf/(?P<id>\d+)', [
            'methods'  => 'GET',
            'callback' => [ $this, 'render' ],
            'permission_callback' => [ $this, 'can_access' ],
            'args' => [ 'id' => [ 'validate_callback' => fn( $v ) => ctype_digit( (string) $v ) ] ],
        ] );
    }

    public function can_access( $request ) {
        $id = (int) $request['id'];
        $p = get_post( $id );
        if ( ! $p || $p->post_type !== Klarhed_Attempts::CPT ) return false;
        // Owner or admin
        if ( (int) $p->post_author === get_current_user_id() ) return true;
        if ( current_user_can( 'edit_users' ) ) return true;
        return false;
    }

    public function render( $request ) {
        $attempt = Klarhed_Attempts::hydrate( get_post( (int) $request['id'] ) );
        $user    = get_userdata( get_post( (int) $request['id'] )->post_author );
        $html    = $this->build_html( $attempt, $user );

        if ( class_exists( '\\Dompdf\\Dompdf' ) ) {
            $dompdf = new \Dompdf\Dompdf( [ 'isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true ] );
            $dompdf->loadHtml( $html, 'UTF-8' );
            $dompdf->setPaper( 'A4', 'portrait' );
            $dompdf->render();
            $out = $dompdf->output();
            nocache_headers();
            header( 'Content-Type: application/pdf' );
            header( 'Content-Disposition: attachment; filename="klarhed-' . $attempt['id'] . '.pdf"' );
            echo $out; exit;
        }

        // Fallback: printable HTML
        nocache_headers();
        header( 'Content-Type: text/html; charset=UTF-8' );
        echo $html; exit;
    }

    private function build_html( $attempt, $user ) {
        $course  = Klarhed_Course::get_data();
        $primary = get_option( 'klarhed_settings' )['primary_color'] ?? '#B4E600';
        $ink     = '#0F2A2A';

        $css = '
            @page { size: A4; margin: 22mm 18mm; }
            body { font-family: Georgia, serif; color: ' . $ink . '; line-height: 1.6; }
            h1 { font-size: 28pt; font-weight: normal; margin: 0 0 4pt; }
            h2 { font-size: 16pt; font-weight: normal; margin: 20pt 0 6pt; border-bottom: 2pt solid ' . $primary . '; padding-bottom: 4pt; }
            h3 { font-size: 12pt; font-weight: normal; margin: 14pt 0 4pt; color: #4E6262; }
            .eyebrow { font-family: monospace; font-size: 9pt; letter-spacing: .1em; text-transform: uppercase; color: #7C8C8C; }
            .field   { margin: 6pt 0 10pt; padding: 8pt 10pt; background: #FAFAF7; border-left: 2pt solid ' . $primary . '; white-space: pre-wrap; }
            .mq      { width: 100%; border-collapse: collapse; margin-top: 8pt; }
            .mq td   { padding: 4pt 6pt; border-bottom: 1pt solid #E3ECEC; font-size: 10pt; }
            .bar     { display: inline-block; height: 8pt; background: ' . $primary . '; vertical-align: middle; }
            footer   { margin-top: 30pt; padding-top: 10pt; border-top: 1pt solid #E3ECEC; font-size: 9pt; color: #7C8C8C; }
        ';

        ob_start(); ?>
        <!doctype html><html><head><meta charset="utf-8">
            <title>KLARHED — <?php echo esc_html( $attempt['name'] ); ?></title>
            <style><?php echo $css; ?></style>
        </head><body>
            <p class="eyebrow">KLARHED-arbejdsbog · <?php echo esc_html( $attempt['name'] ); ?></p>
            <h1><?php echo esc_html( $user->display_name ); ?></h1>
            <p><?php echo esc_html( date_i18n( 'j. F Y', strtotime( $attempt['createdAt'] ) ) ); ?></p>

            <?php if ( $attempt['baseline'] ) : ?>
            <h2><?php esc_html_e( 'Baseline-måling', 'klarhed' ); ?></h2>
            <table class="mq">
                <?php foreach ( $course['baseline']['groups'] as $g ) :
                    $vals = []; foreach ( $g['items'] as $i => $_ ) { $v = $attempt['baseline'][ $g['letter'] . ':' . $i ] ?? 0; if ( $v ) $vals[] = (int) $v; }
                    $avg = $vals ? array_sum( $vals ) / count( $vals ) : 0; ?>
                    <tr>
                        <td style="width:30%"><strong><?php echo esc_html( $g['letter'] ); ?></strong> · <?php echo esc_html( $g['name'] ); ?></td>
                        <td style="width:50%"><span class="bar" style="width:<?php echo ( $avg / 5 * 100 ); ?>%"></span></td>
                        <td style="width:20%; text-align:right"><?php echo $avg ? number_format( $avg, 1 ) : '—'; ?></td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php endif; ?>

            <?php foreach ( $course['chapters'] as $ch ) :
                $rows = [];
                foreach ( (array) $attempt['fields'] as $k => $v ) {
                    if ( strpos( $k, $ch['slug'] . ':' ) === 0 && is_string( $v ) && trim( $v ) !== '' ) $rows[ $k ] = $v;
                }
                if ( ! $rows ) continue; ?>
                <h2><?php echo (int) $ch['n']; ?>. <?php echo esc_html( $ch['name'] ); ?></h2>
                <?php foreach ( $rows as $k => $v ) : ?>
                    <h3><?php echo esc_html( substr( $k, strlen( $ch['slug'] ) + 1 ) ); ?></h3>
                    <div class="field"><?php echo esc_html( $v ); ?></div>
                <?php endforeach;
            endforeach; ?>

            <?php if ( $attempt['finalMeasure'] ) : ?>
            <h2><?php esc_html_e( 'Slutmåling', 'klarhed' ); ?></h2>
            <table class="mq">
                <?php foreach ( $course['baseline']['groups'] as $g ) :
                    $vals = []; foreach ( $g['items'] as $i => $_ ) { $v = $attempt['finalMeasure'][ $g['letter'] . ':' . $i ] ?? 0; if ( $v ) $vals[] = (int) $v; }
                    $avg = $vals ? array_sum( $vals ) / count( $vals ) : 0; ?>
                    <tr>
                        <td style="width:30%"><strong><?php echo esc_html( $g['letter'] ); ?></strong> · <?php echo esc_html( $g['name'] ); ?></td>
                        <td style="width:50%"><span class="bar" style="width:<?php echo ( $avg / 5 * 100 ); ?>%"></span></td>
                        <td style="width:20%; text-align:right"><?php echo $avg ? number_format( $avg, 1 ) : '—'; ?></td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php endif; ?>

            <footer>
                KLARHED-arbejdsbog © Frank Tessin · Eksporteret <?php echo esc_html( date_i18n( 'j. F Y, H:i' ) ); ?>
            </footer>
        </body></html>
        <?php
        return ob_get_clean();
    }
}
