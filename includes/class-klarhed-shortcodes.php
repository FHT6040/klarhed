<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Klarhed_Shortcodes {
    public function __construct() {
        add_shortcode( 'klarhed_course',   [ $this, 'course' ] );
        add_shortcode( 'klarhed_baseline', [ $this, 'baseline' ] );
        add_shortcode( 'klarhed_chapter',  [ $this, 'chapter' ] );
        add_shortcode( 'klarhed_progress', [ $this, 'progress' ] );
        add_shortcode( 'klarhed_manifest', [ $this, 'manifest' ] );
    }

    private function enqueue() {
        wp_enqueue_style( 'klarhed' );
        wp_enqueue_script( 'klarhed-app' );
    }

    public function course() {
        $this->enqueue();
        return '<div id="klarhed-root" data-view="course"></div>';
    }

    public function baseline() {
        $this->enqueue();
        return '<div id="klarhed-root" data-view="baseline"></div>';
    }

    public function chapter( $atts ) {
        $a = shortcode_atts( [ 'slug' => '' ], $atts, 'klarhed_chapter' );
        $this->enqueue();
        return '<div id="klarhed-root" data-view="chapter" data-slug="' . esc_attr( $a['slug'] ) . '"></div>';
    }

    public function progress() {
        $this->enqueue();
        $pct = (int) Klarhed_Progress::completion_pct();
        return '<div class="klarhed-progress-widget"><span>' . esc_html__( 'Dit forløb', 'klarhed' ) . '</span><div class="kh-progress"><div style="width:' . $pct . '%"></div></div><b>' . $pct . '%</b></div>';
    }

    public function manifest() {
        $this->enqueue();
        return '<div id="klarhed-root" data-view="manifest"></div>';
    }
}
