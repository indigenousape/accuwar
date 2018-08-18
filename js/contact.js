

$( document ).ready(function() {


    // Set custom validation messages

    var elements = document.getElementsByTagName("INPUT");
    for (var i = 0; i < elements.length; i++) {
        elements[i].oninvalid = function(e) {
            e.target.setCustomValidity("");
            if (!e.target.validity.valid && (e.target.type.toLowerCase() != 'email' && e.target.value.length === 0)) {
                e.target.setCustomValidity("This field cannot be left blank.");
            } else if (!e.target.validity.valid) {
                e.target.setCustomValidity("Enter a valid email address.");
            }
        };
        elements[i].oninput = function(e) {
            e.target.setCustomValidity("");
        };
    }

    var textarea = document.getElementsByTagName("TEXTAREA");
    for (var i = 0; i < textarea.length; i++) {
        textarea[i].oninvalid = function(e) {
            e.target.setCustomValidity("");
            if (!e.target.validity.valid) {
                e.target.setCustomValidity("This field cannot be left blank.");
            }
        };
        textarea[i].oninput = function(e) {
            e.target.setCustomValidity("");
        };
    }

    // Bind keyup events

    $('input, textarea').keyup(function(e) {

        var thisEl = $(e.currentTarget)[0];
        var $input = $(e.currentTarget);

        if(!thisEl.checkValidity()) {
            $input.addClass('invalid');
            $input.prev().addClass('error');
            $input.next().text(thisEl.validationMessage);
        } else {
            $input.removeClass('invalid');
            $input.prev().removeClass('error');
            $input.next().text('');
        }

    });

    // Bind submit event

    $('#submitForm').submit(function(e) {

            e.preventDefault();

            // Get the values from our form
            var $form = $(this),
                nameTxt = $form[0].name.value,
                emailTxt = $form[0].email.value,
                msgTxt = $form[0].message.value,
                token = $("input[name='token']").val(), //Must be retrieved after DOM load
                url = "contact.php";

            if($(':invalid').length === 0) {

                // Send email data with post
                var posting = $.post(url, {
                    name: nameTxt,
                    email: emailTxt,
                    message: msgTxt,
                    token: token
                });

                // Display response
                posting.done(function (data) {
                    $("#result").empty().append(data);
                });

            } else {

                $('label.error').removeClass('error');
                $('.invalid').removeClass('invalid');

                $(':invalid').each(function() {
                    $(this).addClass('invalid');
                    $(this).prev().addClass('error');
                    $(this).next().text($(this)[0].validationMessage);
                });

                if($('.invalid')[1].value.length === 0) {
                    $('.invalid')[1].focus();
                } else {
                    $('.invalid')[1].select();
                }

                $('#submitForm').removeClass('error');

            }

    });



});

