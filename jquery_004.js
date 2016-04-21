;(function ($) {

  /*  private methods
  ----------------------------------------------------------------------------*/

  // setCFSize
  function setCFSize() {
    var $this = $(this),
      opt = $this.data('coverflow'),
      $curItem = opt.$items.eq(opt.index),

      // set CF items & slider width
      setWidth = function() {
        // items width is simply the main item width * ratio
        opt.item.minWidth = Math.round(opt.item.width*opt.ratio);
        // set CF items width
        opt.$items.width(opt.item.minWidth).eq(opt.index).css('width', opt.item.width);
        // set slider size and position
        opt.$slider.css({
          // slider width is number of items * item width (taking into account the main item)
          width: opt.item.minWidth * (opt.$items.length-1) + opt.item.width,
          // slider position calculated from current index (that can be shifted), altered with main item width
          left: -opt.item.minWidth * (opt.index-opt.shift) + ($this.outerWidth()-opt.item.width)/2
        });
      },

      // set CF & items height
      setHeight = function() {
        // get the automatic generated height (from main item)
        opt.item.height = opt.$items.eq(opt.index).outerHeight();
        $this.add(opt.$items).height(opt.item.height);
      };

    if (opt.width === 'auto') {
      if (opt.height === 'auto') {
        // initialize CF and list items sizes
        $this.add(opt.$items).width(opt.width).height(opt.height);
        // main item width calculated from current CF width and given ratio
        opt.item.width = (1 / (1 + 2 * opt.ratio)) * $this.outerWidth();

        setWidth();
        setHeight();
      }
      else {
        // initialize list items width
        opt.$items.width(opt.width);
        // height is given, set it to CF and items
        opt.item.height = opt.height;
        $this.addClass('autowidth').add(opt.$items).height(opt.item.height);

        // now height is set, get the auto-generated width
        opt.item.width = $curItem.outerWidth();

        setWidth();
      }
    } else {
      // width is given, set it to CF and items
      opt.item.width = opt.width;
      $this.add(opt.$items).height('auto');

      setWidth();
      setHeight();
    }

    //
    if (opt.$shades.length) {
      var gap = ($this.outerWidth() + $curItem.outerWidth()) / 2;
      opt.$shades.filter('.left').css('right', gap);
      opt.$shades.filter('.right').css('left', gap);
    }
  }


  // addCFShortcuts
  //  pressing left/right keybaord arrow allows to slide coverflow
  function addCFShortcuts() {
    var cases = {
      37: $.proxy(coverflow.moveTo, this, -1),
      39: $.proxy(coverflow.moveTo, this, '+1')
    };

    $(document).on('keydown.coverflow.sliding', function (e) {
      (cases[e.keyCode] || $.noop)();
    });
  }


  // addPagingShortcuts
  //  while paging input is focused, pressing arrow up/down slides the coverflow
  function addPagingShortcuts(input) {
    var $coverflow = this,
      opt = $coverflow.data('coverflow'),
      cases = {
        38: function(val) {
          if (opt.index < opt.$items.length - 1) {
            coverflow.moveTo.call($coverflow, '+1');
            input.value = val + 1;
          }
        },
        40: function(val) {
          if (opt.index > 0) {
            coverflow.moveTo.call($coverflow, -1);
            input.value = val - 1;
          }
        }
      };

    $(document).on('keydown.coverflow.paging', function(e) {
      var inputVal = parseInt(input.value, 10);

      // check if input value is a valid number ;
      // abort if coverflow is animated
      if (!isNaN(inputVal) && !$coverflow.data('coverflow').isAnimated) {
        (cases[e.keyCode] || $.noop)(inputVal);
      }
    });
  }


  // setPaging
  function setPaging(paging) {

    var $coverflow = this;

    paging.current = paging.current || 0;

    //
    paging.$form = $.tmpl('<form><input type="text" name="search-paging-form-page" size="'+
      paging.total.toString().length +'" value="'+ (paging.current+1) +
      '"><span>/${total}</span></form>', paging)
      .appendTo(paging.$container);

    // replace left/right arrow keyboard shortcuts by up/down arrow buttons
    //  when editing paging input value
    paging.$form.find('input')
      .on('focus', function() {
        $(document).off('keydown.coverflow.sliding');
        addPagingShortcuts.call($coverflow, this);
      })
      .on('blur', function() {
        $(document).off('keydown.coverflow.paging');
        addCFShortcuts.call($coverflow);
      });

    // cache list item template
    $.template('searchPagingLI', '<li{{if item===current+1}} class="active"{{/if}}><a href="#${item-1}">${item}</a></li>');

    // set the paging list displayed
    setPagingList(paging);

    // activate paging links
    paging.$list.on('click', 'a', function(e) {
      e.preventDefault();
      var pageReq = parseInt(this.hash.slice(1), 10);

      // exit if requested page is already displayed
      if (paging.current === pageReq) { return; }

      paging.current = pageReq;

      // paginate coverflow using link href value
      coverflow.moveTo.call($coverflow, pageReq);
    });

    // activate paging form
    paging.$form.on('submit', function(e) {
      e.preventDefault();
      var inputValue = parseInt(this['search-paging-form-page'].value, 10);

      if (isNaN(inputValue) || inputValue <= 0 || inputValue > paging.total) { return; }

      var pageReq = inputValue - 1;

      // exit if requested page is already displayed
      if (paging.current === pageReq) { return; }

      paging.current = pageReq;

      // paginate coverflow using input form value
      coverflow.moveTo.call($coverflow, pageReq);
    });
  }


  // setPagingList
  //  set the paging list based on current page displayed and the bracket setting
  function setPagingList(paging) {

    // create new list or empty existing one
    paging.$list = typeof paging.$list === 'undefined' ?
      $('<ul>').insertBefore(paging.$form) :
      paging.$list.empty();

    // build the list with a collection of jQuery object using the cached template
    for (var i = paging.current - paging.bracket + 1; i <= paging.current + paging.bracket + 1; i++) {
      if (i > 0 && i <= paging.total) {
        paging.$list.append($.tmpl('searchPagingLI', {
          current: paging.current,
          item: i
        }));
      }
    }
  }

  // loadImages
  //  load images of items which level is closed to the current index ;
  //  number of prev/next images loaded is based on bracket setting
  function loadImages() {
    var $self = this,
      opt = this.data('coverflow'),
      callback = function() { $self.trigger('load.coverflow'); };

    for (var _i = opt.index - opt.paging.bracket - 1;
      _i <= opt.index + opt.paging.bracket + 1;
      _i++)
    {
      if (_i >= 0 && _i < opt.$items.length) {
        // callback given only when it's last image to be loaded
        opt.$items.eq(_i).find('.lazy').lazyload({
          imageSize: opt.imageSize,
          load: _i === opt.index+opt.paging.bracket+1 || _i === opt.$items.length-1 ?
            callback :
            $.noop
        });
      }
    }
  }


  function updateControls(index) {
    var $this = $(this),
      opt = $this.data('coverflow');

    if (index > 0) {
      opt.$prev.show();
    } else {
      opt.$prev.hide();
    }

    if (index === opt.$items.length - 1 ||
      (opt.shift !== 0 && opt.$slider.width() < ($this.width() + opt.item.minWidth * (index+1)))) {
      opt.$next.hide();
    } else {
      opt.$next.show();
    }
  }


  function updateShades(index) {
    var opt = $(this).data('coverflow'),
      shades = {
        left: opt.$shades.filter('.left'),
        right: opt.$shades.filter('.right')
      };

    if (index > 0) {
      shades.left.removeClass('disabled');
    } else {
      shades.left.addClass('disabled').mouseleave();
    }

    if (index === opt.$items.length - 1) {
      shades.right.addClass('disabled').mouseleave();
    } else {
      shades.right.removeClass('disabled');
    }
  }


  /*  coverflow
  ----------------------------------------------------------------------------*/
  var coverflow = {
    init: function (opts) {
      opts = $.extend(true, {
        index: 0,
        items: [],
        url: '',
        isAnimated: false,
        isLegend: true,
        ratio: 0.5,
        width: 300,
        height: 300,
        onUpdate: $.noop,
        $prev: $('<a/>', {
          'href': '#',
          'class': 'coverflow-prev sprite-ui'
        }).append($('<img/>', {
          "class": "sprite-ui-prev",
          "width": 32,
          "height": 31,
          "alt": "",
          "src": $.cfg.path + "img/pixel.png"
        })),
        $next: $('<a/>', {
          'href': '#',
          'class': 'coverflow-next sprite-ui'
        }).append($('<img/>', {
          "class": "sprite-ui-next",
          "width": 32,
          "height": 31,
          "alt": "",
          "src": $.cfg.path + "img/pixel.png"
        })),
        $legend: $('<div/>', { 'class': 'coverflow-legend' }),
        $coverflow: $('<div/>', { 'class': 'coverflow-content' }),
        $template: $.template('coverflow', '<span class="coverflow-label">${label}</span><span class="coverflow-type">${type}</span><span class="coverflow-counter">${index}/${counter}</span>'),
        paging: {
          bracket: 3
        },
        shift: 0
      }, opts);

      return this.each(function () {
        var $self = $(this),
          data = $self.data('coverflow');

        // exit if coverflow already initialized
        if (typeof data !== 'undefined') { return; }

        // create quick access to list, items & shades
        // also create item size properties
        $.extend(opts, {
          $slider: $self.find('ul:first'),
          $items: $self.find('li'),
          item : {
            width: 0,
            height: 0,
            minWidth: 0
          },
          $shades: $self.find('.shade')
        });

        $self
          .data('coverflow', opts)
          .on('load.coverflow', $.proxy(setCFSize, $self));

        $('#page').on('resize', $.proxy(setCFSize, $self));

        setCFSize.call(this);

        // load all items images if there are less than 2 times bracket + 1
        if (opts.$items.length < opts.paging.bracket * 2 + 1) {

          var $images = $self.find('.lazy');

          // call lazyload on each image separately so we can know when loading the latest one
          $images.lazyload({
            imageSize: opts.imageSize,
            load: function(index) {
              if (index === $images.length-1) {
                $self.trigger('load.coverflow');
              }
            }
          });
        }
        // If there're more than 2 times bracket + 1 items,
        //  then load only index-closed item's images
        else {
          loadImages.call($self);
        }

        // provide basic keyboard control
        addCFShortcuts.call($self);

        $(window)
          .on('resize.coverflow', function () {
            $self.data('coverflow').onUpdate.call($self[0]);
            setCFSize.call($self);
          });

        if (Modernizr.touch) {
          //jQuery.event.special.swipe.settings.threshold = 0.1;
          //jQuery.event.special.swipe.settings.sensitivity = 5;

          $self
            .on('swipeleft', function () {
              coverflow.moveTo.call($self, '+1');
            })
            .on('swiperight', function () {
              coverflow.moveTo.call($self, -1);
            })
            .on('movestart', function (e) {
              if ((e.distX > e.distY && e.distX < -e.distY) ||
                (e.distX < e.distY && e.distX > -e.distY)) {
                e.preventDefault();
              }
            });
        }

        opts.$prev.on('click.coverflow', function (e) {
          e.preventDefault();
          $self.coverflow('moveTo', -1);
        });

        opts.$next.on('click.coverflow', function (e) {
          e.preventDefault();
          $self.coverflow('moveTo', '+1');
        });

        $self
          .append((opts.url.length || opts.items.length) ? opts.$legend : null)
          .append(opts.$coverflow);

        //
        coverflow.updateData.call($self);

        // set coverflow padding-bottom : make space to display legend
        $self.css('padding-bottom', $self.find('.coverflow-legend:visible').outerHeight(true));

        // prev/next butttons replaced by swipe action on touch devices
        if (!Modernizr.touch) {
          $self
            .append(opts.$prev)
            .append(opts.$next);
        }

        // activate paging
        if (typeof opts.paging.total !== 'undefined' && opts.$items.length > 3) {
          setPaging.call($self, opts.paging);
        }

        //
        if (opts.$shades.length) {

          opts.$prev.add(opts.$next).hover(function(event) {
            if(event.type === 'mouseenter') { $(this).addClass('hover'); }
            else { $(this).removeClass('hover'); }
          });

          opts.$shades.on('click mouseenter mouseleave', function(event) {
            var $control = $(this).hasClass('right') ? opts.$next : opts.$prev;

            if (event.type !== 'click' || !$(this).hasClass('disable')) { $control[event.type](); }
          });
        }

        //
        updateControls.call(this, opts.index);

        updateShades.call(this, opts.index);

        // init moveTo call
        coverflow.moveTo.call(
          $self,
          parseInt(window.location.hash.slice(1), 10) || 0,
          true
        );
      });
    },


    updateData: function () {
      return this.each(function () {
        var $self = $(this),
          data = $self.data('coverflow');

        $self.data('coverflow', $.extend(data, {
          $items: $self.find('li'),
          items: {},
          index: data.index
        }));

        data.$slider.appendTo(data.$coverflow);

        // $(window).trigger('resize.coverflow');
        $self.data('coverflow').onUpdate.call($self[0]);
      });
    },


    updateLegend: function () {
      return this.each(function () {
        var $self = $(this),
          data = $self.data('coverflow');

        data.$legend.html($.tmpl('coverflow', {
          label: data.items[data.index].label,
          type: data.items[data.index].type,
          index: data.index + 1,
          counter: data.items.length
        }));
      });
    },


    // paginate coverflow
    //  offset param is string or int (expected values: -1, '-1', '+1', n)
    moveTo: function (offset, update) {
      return this.each(function () {
        var $self = $(this),
          data = $self.data('coverflow'),
          // set index to move to
          index = parseInt(offset, 10) +
            (typeof offset === 'string' || offset < 0 ? data.index : 0),
          scrollX = -data.item.minWidth * (index-data.shift) + ($self.outerWidth()-data.item.width)/2;

        if (data.isAnimated ||
          data.shift !== 0 && data.$slider.width() < ($self.width() - scrollX) ||
          data.index === 0 && offset < 0 ||
          data.index === data.$items.length - 1 && offset === '+1' ||
          update) {
            return;
        }

        updateControls.call(this, index);

        data.$slider.stop(true, true).animate({
          left: scrollX
        }, $.cfg.transitionDelay, function () {
          $.extend(data, {
            coverflowFx: true
          });

          data.onUpdate.call($self[0]);

          // load more images
          loadImages.call($self);

          if (data.ratio === 1 ||
            (data.coverflowFx && data.oldItemFx && data.currentItemFx))
          {
            $self.data('coverflow', $.extend(data, {
              isAnimated: false,
              coverflowFx: false,
              oldItemFx: false,
              currentItemFx: false
            }));
          }

          updateShades.call($self[0], index);
        });

        if (data.ratio !== 1) {

          data.$items.eq(data.index).animate({
            width: data.item.minWidth
          }, $.cfg.transitionDelay, function () {
            $.extend(data, {
              oldItemFx: true
            });

            if (data.coverflowFx && data.oldItemFx && data.currentItemFx) {
              $self.data('coverflow', $.extend(data, {
                isAnimated: false,
                coverflowFx: false,
                oldItemFx: false,
                currentItemFx: false
              }));
            }
          });

          data.$items.eq(index).animate({
            width: data.item.width
          }, $.cfg.transitionDelay, function () {
            $.extend(data, {
              currentItemFx: true
            });

            if (data.coverflowFx && data.oldItemFx && data.currentItemFx) {
              $self.data('coverflow', $.extend(data, {
                isAnimated: false,
                coverflowFx: false,
                oldItemFx: false,
                currentItemFx: false
              }));
            }
          });
        }

        $self.data('coverflow',
          $.extend(data, {
            isAnimated: true,
            index: index
          }));

        if (data.url.length) {
          $self.coverflow('updateLegend');
        }

        // update paging list if needed
        if (typeof data.paging.total !== 'undefined' && data.$items.length > 3) {
          data.paging.current = index;
          setPagingList(data.paging);

          // also update input form
          data.paging.$form.find('input[type=text]')[0].value = index+1;
        }
      });
    },


    destroy: function () {
      $(window).off('resize.coverflow');
      $(document).off('keydown.coverflow');

      return this.each(function () {
        var $self = $(this),
          data = $self.data('coverflow');

        if (!data) { return; }

        data.$prev.off('click.coverflow')
          .remove();
        data.$next.off('click.coverflow')
          .remove();
        data.$coverflow.children()
          .unwrap();
        $self.removeData('coverflow');
      });
    }
  };


  $.fn.coverflow = function (method) {
    if (coverflow[method]) {
      return coverflow[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return coverflow.init.apply(this, arguments);
    }
  };

})(jQuery);
