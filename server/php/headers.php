<?php
/* Bao Teck Tea House — optional PHP security headers.
   You do NOT need this if your host reads the .htaccess file (most do).
   Use it only if you are on PHP hosting without .htaccess support:
   add  <?php require __DIR__.'/server/php/headers.php'; ?>  to the top of a page. */

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; ".
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ".
       "font-src 'self' https://fonts.gstatic.com; script-src 'self'; ".
       "frame-src https://www.google.com https://maps.google.com; ".
       "object-src 'none'; base-uri 'self'; form-action 'self'");
header('Content-Type: text/html; charset=utf-8');
