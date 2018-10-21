<!DOCTYPE html>
<!--[if lt IE 9]>
<html class="no-js lt-ie9" lang="en"> <![endif]-->
<!--[if gt IE 8]><!-->
<html lang="en" role="main"> <!--<![endif]-->
<head>
  <title>[ accuwar ] - Turn-based strategy game and battle simulator. Play free.</title>

  <meta charset="utf-8">

  <meta name="description" content="Build your empire and raise armies to defeat your enemy in this turn-based strategy game. Play alone or side-by-side on all devices.">
  <meta name="keywords" content="strategy games, war games, battle simulator, war simulator, empire builders, turn-based strategy games, free games, web games, turn-based games, free web games, free strategy games, free HTML5 games, free war games, browser games, games like risk, games like civilization, free games">
  <link rel="author" href="https://www.linkedin.com/in/joshmharris" />
  <link rel="canonical" href="http://www.accuwar.com" />

  <link rel="shortcut icon" href="favicon.ico">
  <link rel="icon" sizes="16x16 32x32 64x64" href="favicon.ico">
  <link rel="icon" type="image/png" sizes="196x196" href="favicon-192.png">
  <link rel="icon" type="image/png" sizes="160x160" href="favicon-160.png">
  <link rel="icon" type="image/png" sizes="96x96" href="favicon-96.png">
  <link rel="icon" type="image/png" sizes="64x64" href="favicon-64.png">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="favicon-16.png">
  <link rel="apple-touch-icon" href="favicon-57.png">
  <link rel="apple-touch-icon" sizes="114x114" href="favicon-114.png">
  <link rel="apple-touch-icon" sizes="72x72" href="favicon-72.png">
  <link rel="apple-touch-icon" sizes="144x144" href="favicon-144.png">
  <link rel="apple-touch-icon" sizes="60x60" href="favicon-60.png">
  <link rel="apple-touch-icon" sizes="120x120" href="favicon-120.png">
  <link rel="apple-touch-icon" sizes="76x76" href="favicon-76.png">
  <link rel="apple-touch-icon" sizes="152x152" href="favicon-152.png">
  <link rel="apple-touch-icon" sizes="180x180" href="favicon-180.png">
  <meta name="msapplication-TileColor" content="#FFFFFF">
  <meta name="msapplication-TileImage" content="favicon-144.png">
  <meta name="msapplication-config" content="browserconfig.xml">

  <meta name="viewport" content="width=device-width">

  <!-- Stylesheets -->
  <link rel="stylesheet" type="text/css" href="css/bootstrap.min.css" />
  <link rel="stylesheet" type="text/css" href="css/styles.min.css" />

</head>
<body>
<?php
/**
 * contact_view.php
 *
 * Contact Form Front-End
 * [accuwar]
 *
 * @author     Josh Harris
 * @copyright  2018 Josh Harris
 * 
 * Form Security Technique: https://css-tricks.com/serious-form-security/
 *
 */

//Start a session to access any available session variables
session_start();

function generateFormToken($form) {
    
       // generate a token from an unique value
      $token = md5(uniqid(microtime(), true));  
      
      // Write the generated token to the session variable to check it against the hidden field when the form is sent
      $_SESSION[$form .'_token'] = $token; 
      
      return $token;

}
?>

<div class="col-xs-12 col-sm-8 col-sm-offset-2 col-lg-6 col-lg-offset-3" id="contactForm">

    <h1>[accuwar]</h1>


    <p>Have an idea? Found a bug? Reach out below and let us know.</p>

    <?php
       // generate a new token for the $_SESSION superglobal and put them in a hidden field
       $newToken = generateFormToken('form1');   
    ?>
    <div id="result">
      <form name="contactForm" id="submitForm" novalidate>
          <input type="hidden" name="token" value="<?php echo $newToken; ?>">
          <div class="row" id="formRow">
              <div class="form-group col-md-8 col-lg-6">
                  <label for="name">Name <span class="required">*</span></label>
                  <input type="text" name="name" class="form-control" autofocus required>
                  <span class="error"></span>
              </div>
              <div class="form-group col-md-8 col-lg-6">
                  <label for="email">Email Address <span class="required">*</span></label>
                  <input type="email" name="email" class="form-control" required>
                  <span class="error"></span>
              </div>
              <div class="clearfix"></div>
              <div class="form-group col-lg-12">
                  <label for="message">Message <span class="required">*</span></label>
                  <textarea name="message" class="form-control" rows="6" required></textarea>
                  <span class="error"></span>
              </div>
              <div class="form-group submit-col col-lg-12">
                  <button type="submit" class="btn btn-primary pull-left">Submit</button>
              </div>
          </div>
      </form>
    </div>

</div>

<p class="small text-muted version-text">Beta <span class="release-txt">Release 4.1.0</span></p>

<script src="js/jquery-3.2.1.min.js"></script>
<script src="js/contact.js"></script>

</body>
</html>