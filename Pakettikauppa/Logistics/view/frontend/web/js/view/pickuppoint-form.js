/*global define*/
define([
    'Magento_Ui/js/form/form',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/shipping-service',
    'Magento_Checkout/js/model/shipping-rate-registry'
], function(Component, quote, shippingService, rateRegistry) {
    'use strict';
    return Component.extend({
        initialize: function () {
            this._super();
            jQuery(document).keypress(function(e) {
                if(e.which == 13) {
                  if (jQuery('#pickuppoint-form input.input-text').is(':focus')) {
                    e.preventDefault();
                    jQuery("#pktkpgetpickups").click();
                    return false;
                  }
                }
            });
            // When modifying shipping form postcode, automatically copy it to
            // pickuppoint-zip for user-friendliness
            jQuery('input[name="postcode"]').on('change', function(e) {
                var pickupZip = jQuery('#pickuppoint-form input[name="pickuppoint-zip"]');
                if (e.target.id === pickupZip.attr('id')) {
                    return false;
                }
                var postcode = jQuery('input[name="postcode"]').val();
                if(postcode.length>0
                   && jQuery('input[name="pickuppoint-zip"]').val().length == 0
                   && !jQuery('#pickuppoint-form input.input-text').is(':focus'))
                {
                    pickupZip.val(postcode).change();
                    jQuery("#pktkpgetpickups").click();
                }
            });
            // component initialization logic
            return this;
        },

        getPickups: function() {
          if (jQuery('#pickuppoint-form input.input-text').length) {
            if (jQuery('#pickuppoint-form input.input-text').val().length) {

              this.source.set('params.invalid', false);
              this.source.trigger('pickuppointForm.data.validate');

              if (!this.source.get('params.invalid')) {
                  var formData = this.source.get('pickuppointForm');

                  jQuery.ajax({
                      showLoader: true,
                      url: '/logistics/index/index',
                      data: {zip_code:formData['pickuppoint-zip']},
                      type: "POST",
                      dataType: 'text',
                      success: function(data){

                        var address = quote.shippingAddress();
                        var shippingMethod = quote.shippingMethod();

                        // address.trigger_reload = new Date().getTime();

                        rateRegistry.set(address.getKey(), null);
                        rateRegistry.set(address.getCacheKey(), null);

                        var address = quote.shippingAddress();
                        quote.shippingAddress(address);
                      },
                      error : function(request,error){
                        console.dir("Error");
                      }
                  })
              }
            }
        }
      }
    });
});
