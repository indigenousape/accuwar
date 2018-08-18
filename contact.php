<?php
/**
 * contact.php
 *
 * Contact Form Mailer and server-side validation for
 * [accuwar]
 *
 * @author     Josh Harris
 * @copyright  2018 Josh Harris
 * 
 * Form Security Techniques: https://css-tricks.com/serious-form-security/
 *
 */

session_start();

$errorHTML = '<div class="container-fluid"><div class="bg-danger contact-response"><img src="https://c1.staticflickr.com/5/4025/4488876837_8d3da2423a_z.jpg" alt="You shall not pass." /><div class="clearfix"></div>';

if(isset($_POST["token"])) {
  $postToken = $_POST["token"];
}

//Whitelist defines which fields are expected from the form
$whitelist = array('name', 'email', 'message', 'token');

// Building an array with the $_POST-superglobal 
foreach ($_POST as $key=>$item) {
        
  // Check if the value $key (fieldname from $_POST) can be found in the whitelisting array, if not, die with a short message to the hacker
  if (!in_array($key, $whitelist)) {
    //Exit the script if a field was submitted that was not from our form.
    die($errorHTML . " <h3>Unexpected fields.</h3></div></div>");
    
  }

}

// Only processes email upon receiving POST requests.
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  //Function to verify the form token
  function verifyFormToken($form) {
    
    // check if a session is started and a token is transmitted, if not return an error
    if(!isset($_SESSION['form1_token'])) { 
      return false;
      }
    
    // check if the form is sent with token in it
    if(!isset($_POST["token"])) {
      return false;
      }
    
    // compare the tokens against each other if they are still the same
    if ($_SESSION[$form.'_token'] !== $_POST["token"]) {
      return false;
      }
  
    return true;
  }

  //If the form tokens exist and match continue with validation
  if (verifyFormToken('form1')) {

    if ($_POST["name"] != "" && $_POST["email"] != "" && $_POST["message"] != "") {

      //Function to check for carriage returns or new line characters
      function injectedDet($s) {
        if (preg_match("(\r|\n)", $s)) {
            die($errorHTML . " <h1>SQL Injection</h1>");//End the process if these characters are found in the field
        }
      }

      // $fields = array("name", "email", "phone");
      $fields = array("name", "email");
      $setFields = [];
      $i = 0;
      foreach ($fields as $field) {
        if (isset($_POST[$fields[$i]])) {
          array_push($setFields, $_POST[$fields[$i]]);
        }
        $i++;
      }

      //Check each field for bad characters
      foreach ($setFields as $post) {
        injectedDet($post);
      }

      //Sanitize name string
      $name = filter_var(trim($_POST["name"]), FILTER_SANITIZE_STRING);//Filter removes tags from the string
      $name = str_replace(array("\r\n","\r","\n"),"",$name);//Remove carriage returns and newline characters just to be sure
      $name = strip_tags($name);//Stripping tags
      $name = htmlentities($name);//Stripping HTML entities
      $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);//Sanitize email
      $message = strip_tags(trim($_POST["message"]));//Removes HTML tags from the string
      $message = htmlentities($message);//Strip HTML entities from the message
      $message = str_replace(array("\r\n","\r","\n"),"",$message);//Remove carriage returns and newline characters just to be sure

      // Check after the above filtering that the name and message still have values
      if (empty($name) OR empty($message)) {
          echo $errorHTML . " <h3>SQL injection detected.</h3></div></div>";
          exit;
      }

      // Validate e-mail
      if (!filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        //echo("$email is a valid email address");

        //Commented lines below to send local emails
        // require('/../PHPMailer/PHPMailerAutoload.php');

        // $mail = new PHPMailer;

        // $mail->isSMTP();                            // Set mailer to use SMTP
        // $mail->Host = 'smtp.gmail.com';             // Specify main and backup SMTP servers
        // $mail->SMTPAuth = true;                     // Enable SMTP authentication
        // $mail->Username = 'harris.josh.m@gmail.com';          // SMTP username
        // $mail->Password = 'W3bS1t9Ja!'; // SMTP password
        // $mail->SMTPSecure = 'tls';                  // Enable TLS encryption, `ssl` also accepted
        // $mail->Port = 587;                          // TCP port to connect to

        // $mail->setFrom($email, $name);
        // $mail->addReplyTo($email, $name);
        // $mail->addAddress('harris.josh.m@gmail.com');   // Add a recipient
        // $mail->addCC('cc@example.com');
        // $mail->addBCC('bcc@example.com');

        // $mail->isHTML(true);  // Set email format to HTML

        $bodyContent = '<table style="width:100%;padding-left:5px;padding-right:5px;padding-bottom:10px;background-color:#000000;color:#ffffff;">';
        $bodyContent .= '<tr><td colspan="2" style="background-color:#000000;"><h2 style="margin-top:0;margin-bottom:0;padding-top:5px;padding-bottom:5px;">Hey Josh,</h2><p>You\'ve got a new message from ' . $name  . ', a visitor to accuwar.com:</p></td></tr>';
        $bodyContent .= '<tr><td colspan="2" style="background-color:#ffffff;padding-left:10px;padding-right:10px;color:#000000;padding-top:10px;padding-bottom:10px;">' . $message . '</td></tr>';
        $bodyContent .= '<tr><td style="width:60px;background-color:#000000;padding-top:10px;"><strong>Name:</strong></td><td style="padding-top:10px;">' . $name . '</td></tr>';
        $bodyContent .= '<tr><td style="width:60px;background-color:#000000;"><strong>Email:</strong></td><td>' . $email . '</td></tr>';
        $bodyContent .= '</table>';

        // $mail->Subject = 'Visitor Message';
        // $mail->Body    = $bodyContent;

        $to = 'XXXXX <XXXXX>';
        $subject = 'Visitor Message';
        $message = $bodyContent;

        // Always set content-type when sending HTML email
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        
        // Additional headers
        $headers .= 'From: ' . $name . ' <' . $email . '>' . "\r\n";
        $headers .= 'Reply-To: ' . $name . ' <' . $email . '>' . "\r\n";
        $headers .= 'Bcc: XXXXX <XXXXX>, ' . $name . ' <' . $email . '>' . "\r\n";

        //if(!$mail->send()) {
        if(!mail($to, $subject, $message, $headers)) {
            echo '<div class="row">';
            //echo '<div class="container-fluid"><div class="bg-danger contact-response"><strong class="str">Something went wrong.</strong> <p class="p">Mailer Error: <code>' . $mail->ErrorInfo . '</code></p></div></div>';
            echo '<div class="container-fluid"><div class="bg-danger contact-response"><strong class="str">Something went wrong with the server.</strong></div></div>';
            echo '</div>';
        } else {
            echo '<div class="row">';
            echo '<div class="container-fluid"><div class="bg-success contact-response"><strong class="str">Thank you!</strong> <p>Your message has been received.</p> </div></div>';
            echo '</div>';
        }

      } else {
          //Email isn't valid
          echo $errorHTML . " <h3>That's not a real email address.</h3></div></div>";
      }

    } else {
      //One or more fields are blank.
      echo $errorHTML . " <h3>Required fields are blank.</h3></div></div>";

    }

  } else {

    //Token variables either don't exist or don't match
    echo $errorHTML . " <h3>Access denied.</h3></div></div>";
    //echo "Session Token: " . $_SESSION['form1_token'] . " | ";
    //echo "Post Token: " . $postToken;
  } 

} else {

  //Was not a POST request
  echo $errorHTML . " <h3>Bad Request.</h3></div></div>";

}
?>