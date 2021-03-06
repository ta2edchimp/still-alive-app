'use strict';

function getDefaultView( { name, answer } ) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Is ${name} still alive?</title>
      <style>
        body { font-size: 20px; line-height: 25px; font-family: 'Lucida Grande', Lucida, 'Helvetica Neue', Helvetica; font-weight: normal; font-style: normal; text-align: center; }
        h1 { font-size: 40px; line-height: 50px; }
        p > strong { font-size: 60px; line-height: 60px; }
        p > small { font-size: 10px; line-height: 13px; }
      </style>
    </head>
    <body>
      <h1>Is ${name} still alive?</h1>
      <p><strong>${answer}</strong></p>
      <form>
        Is <input value="${name}"> still alive <button>?</button>
      </form>
      <p><small>BEERWARE LICENSE - Source Code <a href="https://github.com/ta2edchimp/still-alive-app">on GitHub</a> &amp; <a href="/_src">on zeit.co</a></small></p>
      <script>
        !function( f, i ) {
          f.addEventListener( 'submit', function ( e ) {
            e.preventDefault(); e.stopPropagation();
            window.location.href = '/' + i.value;
          } )
        }(document.querySelector( 'form' ), document.querySelector( 'input' ));
      </script>
    </body>
  </html>
  `;
}

module.exports = {
  getDefaultView
};
