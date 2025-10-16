  window.onload = function(e) {
      $('head').append('<link rel="stylesheet" href="https://accsmoll.com/assets/css/cart/style_cart.css?d=1" type="text/css" />');
      $('head').append('<link rel="stylesheet" href="https://accsmoll.com/assets/css/cart/gritter.css?1=1" type="text/css" />');
      $('head').append('<script src="https://accsmoll.com/assets/js/gritter.js"></script>');
      // $('head').append('<script src="https://accsmoll.com/assets/js/headPop.js?gg=' + Math.floor(Math.random() * 99999999999999999999999999999999999999999999) + '"></script>');
      cart_script = document.createElement("script");
      cart_script.src = 'https://accsmoll.com/assets/js/lequecart_lang.js?new=46';
      document.body.appendChild(cart_script);
      console.log("Script cart loaded");
  };


// 11sad


