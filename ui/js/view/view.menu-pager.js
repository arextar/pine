/*jslint nomen: true, plusplus: true, undef: true, todo: true, white: true,
  browser: true, indent: 2, maxlen: 80 */
/*global Backbone: false, _: false, $: false, KeyRouter: false, publish: false,
  subscribe: false */

// Pine menu pager module
define(['exports'], function (menuPager) {

  'use strict';

  var $win = $(window);

  menuPager.view = Backbone.View.extend({

    'events': {
      'keydown': 'onKeydown'
    }


    /**
     * @param {Object} opts
     *   @param {Object} app
     *   @param {jQuery} $el
     *   @param {Array.<MenuView>} menuViews Must have at least one menuView.
     */
    ,'initialize': function (opts) {
      _.extend(this, opts);

      /** @type {number} */
      this._currentMenuIndex = null;

      /** @type {jQuery} */
      this._$rail = this.$el.find('.menu-pager-rail');

      _.each(this.menuViews, function (menuView, i) {
        menuView.$el.css({
          'position': 'absolute'
          ,'top': 0
        });
      }, this);

      this._onWindowResize();
      $win.on('resize', _.bind(this._onWindowResize, this));
      this.activateMenu(0);
    }


    /**
     * @param {jQuery.Event} evt
     */
    ,'_onWindowResize': function (evt) {
      this.$el.width($win.width());
      _.each(this.menuViews, function (menuView, i) {
        menuView.$el.css({
          'left': i * $win.width()
        });
      }, this);
    }


    /**
     * @param {jQuery.Event} evt
     */
    ,'onKeydown': function (evt) {
      var which = evt.which;
      if (which === this.app.constants.key.W) {
        this.activateMenu(this._currentMenuIndex - 1);
      } else if (which === this.app.constants.key.E) {
        this.activateMenu(this._currentMenuIndex + 1);
      }
    }


    /**
     * @param {number} index
     */
    ,'activateMenu': function (index) {
      index = Math.max(index, 0);
      index = Math.min(index, this.menuViews.length - 1);
      var targetMenu = this.menuViews[index];
      this.$el.height(targetMenu.$el.outerHeight(true));
      this._currentMenuIndex = index;

      // The logic gets a little tricky here because an animation may not be
      // occurring - meaning that the element is moving to the position that it
      // is already in.
      var targetLeft = -parseInt(targetMenu.$el.css('left'), 10);
      if (targetLeft === parseInt(this._$rail.css('left'), 10)) {
        // No animation occurred, just execute the callback.
        targetMenu.activate();
      } else {
        this._$rail
          .css('left', targetLeft)
          .off('webkitTransitionEnd')
          // Need to use $.fn.one here because multiple webkitTransitionEnd
          // events fire on the _$rail element.
          // TODO: Figure out why that happens...
          .one('webkitTransitionEnd',
              _.bind(targetMenu.activate, targetMenu));
      }
    }


    ,'reactivateCurrentMenu': function () {
      this.activateMenu(this._currentMenuIndex);
    }

  });

});
