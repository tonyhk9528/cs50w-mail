document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Submit button is clicked
  document.querySelector('#compose-form').addEventListener('submit', function(event){
    event.preventDefault();
    console.log("Submitting email...")
    send_email();
  })
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Render inbox, sent or archieved
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    // ... do something else with emails ...
    const view = document.querySelector('#emails-view');
    const table = document.createElement('table');
    table.classList.add('table', 'table-hover');
    view.append(table);
    emails.forEach(email => {
      
      const row = document.createElement('tr');
      row.classList.add('email-row');
      row.setAttribute('data-id', email.id);
      row.addEventListener('click', () => {
        open_email(email.id);
      });

      if (email.read){
        row.classList.add('table-active');
      }

      const sender = document.createElement('td');
      const subject = document.createElement('td');
      const time = document.createElement('td');

      sender.innerHTML= email['sender'];
      sender.classList.add('view-email');

      subject.innerHTML = email['subject'];
      subject.classList.add('view-subject');

      time.innerHTML = email['timestamp'];
      time.classList.add('view-timestamp');

      row.append(sender, subject, time);
      table.append(row);

      
    });
  });
}

function send_email() {
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });
}

function reply_email(id){
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log(email);
  
        // Pre-fill form
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = `Re: `;
        document.querySelector('#compose-body').value = '';
    });
  

}

function open_email(id){
  // Show email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  document.querySelector('#archieve-btn').addEventListener('click', () => {
    if (this.innerHTML === 'Archive'){
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      .then(()=>{
        alert('The email is archieved.');
        load_mailbox('inbox');
      })
    }
    else {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      .then(()=>{
        alert('The email is unarchieved.');
        load_mailbox('inbox');
      })
    }

  })

  document.querySelector('#reply-btn').addEventListener('click', function() {
    reply_email(id);
  })

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  
    
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // ... do something else with email ...


    // Populate div with email
    document.querySelector('.ed-from').innerHTML = `<strong>From:</strong> ${email.sender}`;
    document.querySelector('.ed-to').innerHTML = `<strong>To:</strong> ${email.recipients}`;
    document.querySelector('.ed-subject').innerHTML = `<strong>Subject:</strong> ${email.subject}`;
    document.querySelector('.ed-timestamp').innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`;
    document.querySelector('.ed-email-subject').innerHTML = email.subject;
    document.querySelector('.ed-email-text').innerHTML = email.body;

    if (email.archived){
      document.querySelector('#archieve-btn').innerHTML = 'Unarchieve';
    } else {
      document.querySelector('#archieve-btn').innerHTML = 'Archieve';
    }

  });

}


