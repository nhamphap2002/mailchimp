(function($j){
  $j.cfg = {
    path           : "../",
    transitionDelay: 300
  };

  $j(function(){
    var $cf = $j('div.grdn-longchamp_content_main div.coverflow'),
      nbItems = $cf.find('ul:first').children().length,
      index = 0,
      mobile = Modernizr.mq('only all and (max-width: 750px)'),
      updatePrice = function() {
        var salesColor = $j(this).closest('.grdn-longchamp_color-sales').length ? true : false,
          $originalPrice = $j('#grdn-longchamp_price del');

        if(salesColor) {
          $originalPrice.show();
        } else {
          $originalPrice.hide();
        }
      };

    updatePrice.call($j('.grdn-longchamp_product_details input:radio:checked')[0]);

    $j('div.grdn-longchamp_product_desc ul.grdn-longchamp_tabs_list').tabs();
    $j('div.grdn-longchamp_nav ul.grdn-longchamp_nav_l1').nav();
    $j('.grdn-longchamp_product_details').colorProductPicker({
      url: '../json/product.json',
      onChange: updatePrice,
      onLoad: function(){
        $j('#grdn-longchamp_product_img').empty().spin().spin('open');
      },
      onSuccess: function($img){
        $j('#grdn-longchamp_product_img').spin('destroy');
        $j('#grdn-longchamp_product_img').html($img.hide().fadeIn(600));
      }
    });

    // initialize Coverflow
    $cf.coverflow({
      ratio: 0.5,
      width: mobile ? 220 : 'auto',
      height: 'auto',
      index: index,
      paging: {
        current: index,
        total: nbItems,
        $container: $j('<div>', { 'class': 'coverflow-paging' }).insertAfter('.grdn-longchamp_content_main')
      },
      imageSize: 'large',
      onUpdate: function(){
          console.log($j(this))
        var $self = $j(this),
            _i = $self.data('coverflow').index;

        $self.find('.coverflow-legend').appendTo($self).hide().eq(_i).show();
      }
      
    });
  });
})(jQuery);
