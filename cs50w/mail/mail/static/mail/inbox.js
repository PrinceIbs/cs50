document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  //Let the game begin
  document.querySelector("#compose-form").onsubmit = send_mail;

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view-heading').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-view-heading').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view-heading').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Display the content corresponding to button clicked
  if (mailbox == 'inbox') {
      show_mail(mailbox);
  } else if (mailbox == 'sent') {
      show_mail(mailbox);
  } else if (mailbox == 'archive') {
      show_mail(mailbox);
  }else {
      console.log("nothing for now.")
  }
}

function send_mail() {
    // Get the parameters of the email to be sent
    const to = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: `${to}`,
            subject: `${subject}`,
            body: `${body}`
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result == 201) {
            load_mailbox('sent');
        } else {
            load_mailbox('sent');
            console.log(result.error);
        }
    });
    // Prevents the page from reloading
    return false;
}

function show_mail(mailbox) {
    console.log(`You clicked on ${mailbox}`);

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        console.log(emails);
        // Clears the view and update it
        document.querySelector('#emails-view').innerHTML = '';
        emails.forEach(list_view);
    })
    function list_view(mail) {
        // Create child elements under email
        const sender = document.createElement('span');
        if (mailbox == 'sent') {
            sender.className = 'recipients';
            sender.innerHTML = mail.recipients;
        } else {
            sender.className = 'sender';
            sender.innerHTML = mail.sender;
        }

        const subject = document.createElement('span');
        subject.className = 'subject';
        subject.innerHTML = mail.subject;

        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.innerHTML = moment(mail.timestamp).format('MMM D YYYY, h:mm A');

        // Append a child element to the div
        const email = document.createElement('div');
        if (mail.read) { email.className = 'opened_emails'; }
        else { email.className = 'notopened_emails'; }
        email.append(sender);
        email.append(subject);
        email.append(timestamp);

        // Add event listener to the div
        email.addEventListener('click', () => {
            console.log("You can stop here for today.😇😇😇😇");
            // Set the read property of the mail to true
            read(mail.id);
            // Display the content of the mail
            content_view(mail.id, mailbox);
        })
        document.querySelector('#emails-view').append(email);
    }
}

// Mark a mail as read
function read(mail_id) {
    fetch(`emails/${mail_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
}

function content_view(mail_id, mailbox) {
    // Show the email content and hide other views
    document.querySelector('#content-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    // Get the mail with the provided id
    fetch(`emails/${mail_id}`)
    .then(response => response.json())
    .then(mail => {
        details(mail, mailbox);
    })
}

function details(mail, mailbox) {
    // Display the mail contents appropraitely
    document.querySelector('#sender').innerHTML = mail.sender;
    document.querySelector('#recipients').innerHTML = mail.recipients;
    document.querySelector('#subject').innerHTML = mail.subject;
    document.querySelector('#timestamp').innerHTML = moment(mail.timestamp).format('MMM D YYYY, h:mm A');
    document.querySelector('#body').innerHTML = mail.body;

    // Archive or Unarchive emails
    const archive = document.querySelector('#archive');
    const rep = document.querySelector('#reply');
    if (mailbox == 'sent') {
        rep.style.display = 'none';
        archive.style.display = 'none';
        archived = '';
    } else {
        rep.style.display = 'block';
        archive.style.display = 'block';
        if (mail.archived == true) {
            var archived = 'False';
            archive.innerHTML = 'Unarchive';
        } else {
            archive.innerHTML = 'Archive';
            archived = 'True';
        }
    }
    document.querySelector('#archive').addEventListener('click', () => {
        console.log("you click archieved");
        fetch(`emails/${mail.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: `${archived}`
            })
        })
        //Load the inbox after archiving/unarchiving the mail
        load_mailbox('inbox');
    });
    document.querySelector('#reply').addEventListener('click', () => reply(mail));
}

function reply(mail) {
    // Show compose view and hide other views
    document.querySelector('#emails-view-heading').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#content-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    const user = document.querySelector('#user').innerHTML;
    var now = moment().format('MMM D YYYY, h:mm A');
    const body = `On ${now}, ${user} wrote:`;
    var subject = '';

    // Checks if the subject contains 'Re: '
    if (mail.subject.includes('Re:')) {
        subject = `${mail.subject}`;
    } else {
        subject = `Re: ${mail.subject}`;
    }
    // fill in composition fields
    document.querySelector('#compose-recipients').value = mail.sender;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
}
