/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    design
 * @package     enterprise_connect
 * @copyright   Copyright (c) 2011 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */

var getExtensionButton = Class.create({
    extensionId: null,
    versionId: null,
    buttonAction: null,
    editionIsFreeStatus: null,
    defaultConnectVersion: null,
    hasPackageUploadedToChannel10: null,
    hasPackageUploadedToChannel20: null,
    extensionKey10: null,
    extensionKey20: null,
    customerHasTenant: null,
    btnTitleGetExtensionKeyMsg: null,
    btnTitleVisitSiteMsg: null,
    btnTitleBuyNowMsg: null,
    btnTitleGetNowMsg: null,
    billingSystemDowntimeMsg: null,
    billingSystemPaymentsEnabled: null,
    btnTitleInstallNowMsg: null,
    btnTitleInstallNowMsgTip: null,
    visitDevelopersWebsite: null,
    acceptAgreementMsg: null,
    changeMsg: null,
    button: null,
    buttonFree: null,
    selectElement: null,
    addToCartUrl: null,
    currentPageUrl: null,
    downloadCounterUrl: null,
    downloadCounterFormKey: null,
    extensionName: null,
    extensionPrice: null,
    editionTitle: null,
    checkoutWindow: null,

    /**
     * Initialize button
     */
    initialize: function(config)
    {
        //Initialize config values
        this.versionId = config.versionId;
        this.buttonAction = config.buttonAction;
        this.editionIsFreeStatus = config.editionIsFreeStatus;
        this.defaultConnectVersion = config.defaultConnectVersion;
        this.hasPackageUploadedToChannel10 = config.hasPackageUploadedToChannel10;
        this.hasPackageUploadedToChannel20 = config.hasPackageUploadedToChannel20;
        this.extensionKey10 = config.extensionKey10;
        this.extensionKey20 = config.extensionKey20;
        this.customerHasTenant = config.customerHasTenant;
        this.btnTitleGetExtensionKeyMsg = config.btnTitleGetExtensionKeyMsg;
        this.btnTitleVisitSiteMsg = config.btnTitleVisitSiteMsg;
        this.btnTitleBuyNowMsg = config.btnTitleBuyNowMsg;
        this.btnTitleGetNowMsg = config.btnTitleGetNowMsg;
        this.billingSystemDowntimeMsg = config.billingSystemDowntimeMsg;
        this.billingSystemPaymentsEnabled = config.billingSystemPaymentsEnabled;
        this.btnTitleInstallNowMsg = config.btnTitleInstallNowMsg;
        this.btnTitleInstallNowMsgTip = config.btnTitleInstallNowMsgTip;
        this.acceptAgreementMsg = config.acceptAgreementMsg;
        this.changeMsg = config.changeMsg;
        this.addToCartUrl = config.addToCartUrl;
        this.currentPageUrl = config.currentPageUrl;
        this.downloadCounterUrl = config.downloadCounterUrl;
        this.downloadCounterFormKey = config.downloadCounterFormKey;
        this.extensionId = config.extensionId;
        this.extensionName = config.extensionName;
        this.editionTitle = config.editionTitle;
        this.extensionPrice = config.extensionPrice;
        this.checkoutWindow = config.checkoutWindow;

        //Initialize DOM elements
        this.buttonContainer = $('button-purchase');
        this.button = $('button-purchase-input');
        this.buttonFree = $('get-extension-button-free');
        this.licenseAgreementBox = $('license-agreement-box');
        this.extensionKeyBox = $('extension-key-box');
        this.extensionKeyInput = $('extension-key-input');
        this.selectElement = $('available_edition_edition_id');
        this.visitDevelopersWebsite = $('visit-dev-website-msg');

        this.initEvents();
    },

    /**
     * Initialize events
     */
    initEvents: function()
    {
        Event.stopObserving(this.buttonFree, 'click');
        Event.observe(this.buttonFree, 'click', this.onButtonFreeClick.bind(this));
        Event.stopObserving($('select-extension-key'), 'click');
        Event.observe($('select-extension-key'), 'click', this.onSelectExtensionKey.bind(this));

        if (this.selectElement) {
            this.renderButton();
            Event.stopObserving(this.selectElement, 'click');
            Event.observe(this.selectElement, 'change', this.renderButton.bind(this));
            Event.stopObserving(this.button, 'click');
            Event.observe(this.button, 'click', this.actionButton.bind(this));
        } else {
            // if no compatible versions are available - remove div with button
            $('get-extension-button').remove();
        }
    },

    onSelectExtensionKey: function()
    {
        this.extensionKeyInput.focus();
        this.extensionKeyInput.select();
    },

    /**
     * Re-initialize events after edition in select change
     */
    reInitFreeButtonEvents: function()
    {
        if (this.selectElement) {
            Event.observe(this.selectElement, 'change', this.renderButton.bind(this));
            Event.observe(this.button, 'click', this.actionButton.bind(this));
        } else {
            // if no compatible versions are available - remove div with button
            $('get-extension-button').remove();
        }
    },

    /**
     * Get currently selected edition
     *
     * @return String
     */
    getEditionId: function()
    {
        return this.selectElement.getValue();
    },

    /**
     * Render button title and label
     */
    renderButton: function()
    {
        var editionId = this.getEditionId();
        this.licenseAgreementBox.hide();
        this.extensionKeyBox.hide();
        this.buttonContainer.setStyle({display: 'block'});
        this.visitDevelopersWebsite.hide();

        var title = '';
        if (this.buttonAction == 'checkout') { // Magento Go
            if (this.editionIsFreeStatus) {
                title = this.btnTitleGetNowMsg;
            } else {
                title = this.btnTitleBuyNowMsg;
            }
        } else if (this.buttonAction == 'getkey') { // Magento EE, PE, CE
            if (this.hasPackageUploadedToChannel10 || this.hasPackageUploadedToChannel20) {
                this.reInitFreeButtonEvents();
            }
            title = this.btnTitleInstallNowMsg;
        } else if (this.buttonAction == 'visit') { // Magento EE, PE, CE
            title = this.btnTitleGetExtensionKeyMsg;
            this.visitDevelopersWebsite.setStyle({display: 'block'});
        }

        this.button.writeAttribute('title', title);
        this.button.innerHTML = title;

        // Release tooltip for Buy Now button if Zuora is disabled
        if (title == this.btnTitleBuyNowMsg && !this.billingSystemPaymentsEnabled) {
            this.button.writeAttribute('disabled', 'disabled');
            this.button.writeAttribute('title', '');
            if (!this.buttonContainer.getElementsByClassName('ui-tooltip').length && this.button.parentNode && this.button.parentNode.tagName) {
                this.button.insert({after: '<div class="ui-tooltip" style="width:145px;">' + this.billingSystemDowntimeMsg + '</div>'});
            }
        }

        // Release tooltip for Install Now button
        if (title == this.btnTitleInstallNowMsg) {
            this.button.writeAttribute('title', '');
            if (!this.buttonContainer.getElementsByClassName('ui-tooltip').length && this.button.parentNode && this.button.parentNode.tagName) {
                this.button.insert({after: '<div class="ui-tooltip">'+ this.btnTitleInstallNowMsgTip +'</div>'});
            }
        }

        // if there is free button and no package to download show error message otherwise render button
        if ((!this.hasPackageUploadedToChannel10) && (!this.hasPackageUploadedToChannel20)
            && (this.buttonAction == 'getkey')
            ) {
            $('no-package-to-download-box').setStyle({display: 'block'});
            $('get-extension-button').setStyle({display: 'none'});
        } else {
            $('no-package-to-download-box').setStyle({display: 'none'});
            $('get-extension-button').setStyle({display: 'block'});
        }
    },

    /**
     * Show checkout popup
     */
    showGoCheckoutPopup: function() {
        if (this.customerHasTenant) {
            var editionId = this.getEditionId();
            if (this.buttonAction != 'checkout') {
                return;
            }

            var price = $$('strong#extension-price');
            if (price && price.first() && price.first().innerHTML) {
                price = parseInt(price.first().innerHTML.substr(1));
            } else {
                price = 0;
            }

            gaTracker.trackCheckout('buyNow', {
                extensionId: this.extensionId,
                extensionName: this.extensionName,
                price: price
            });

            var addToCartUrlWithEdition = this.addToCartUrl;
            addToCartUrlWithEdition += (this.addToCartUrl.indexOf('?') != -1) ? '&' : '?';
            addToCartUrlWithEdition += 'edition=' + editionId;
            this.checkoutWindow.activateWindow({
                href: addToCartUrlWithEdition,
                width: 706,
                type: 'external_checkout'
            });
        } else {
            gaTracker.trackCheckout('noStore', {
                extensionId: this.extensionId,
                extensionName: this.extensionName
            });

            var content = $('no_active_stores').innerHTML;
            var div = new Element('div', {'id': 'no_active_stores_clone'})
                .setStyle({'display': 'none'}).update(content);
            $('no_active_stores').insert({before: div});
            this.checkoutWindow.activateWindow({
                href: this.currentPageUrl + '#no_active_stores_clone',
                width: 460,
                height: 330
            });
        }
    },

    /**
     * Button action
     */
    actionButton: function()
    {
        var editionId = this.getEditionId();
        if (this.buttonAction == 'checkout') { // Magento Go
            // Deny all actions on Buy Now button if Zuora is disabled
            if (this.buttonAction == 'checkout' && !this.editionIsFreeStatus && !this.billingSystemPaymentsEnabled) return false;

            if (LOGGED_IN) {
                this.showGoCheckoutPopup();
            } else { // show login form and create hidden field to force show checkout pop-up immediately after login
                if (!document.getElementsByName('login[show_go_checkout]').length) {
                    // native element creation used because of bug in old prototype in IE (at least ver.9)
                    var inputEl   = document.createElement('input');
                    inputEl.type  = 'hidden';
                    inputEl.value = 1;
                    inputEl.name  = 'login[show_go_checkout]';
                    $A(document.getElementsByName('login[back_url]')).each(function(e) {
                        $(e).insert({after: inputEl});
                    });
                }
                customerAuthorization.popupOpen(
                    '#authorization-popup-login-form',
                    {url:this.currentPageUrl, notation:i18n['loginPopupGetExtension']}
                );
            }
        } else { // Magento EE, PE, CE
            // remove mark to force MGo checkout popup
            $A(document.getElementsByName('login[show_go_checkout]')).each(function(e) {e.length && e.remove();});

            if (this.editionIsFreeStatus) {// Free extension
                if (LOGGED_IN) {
                    this.buttonContainer.hide();
                    this.licenseAgreementBox.setStyle({display: 'block'});
                } else {
                    this.manageLoginBox('login-required-box-free');
                }
            } else {// Paid extension
                if (LOGGED_IN) {
                    var landingUrl = $('landing-url').getValue();
                    if (landingUrl) {
                        this.downloadCounter(editionId, landingUrl);
                        window.open(landingUrl, 'extension_landing_url');
                    }
                } else {
                    this.manageLoginBox('login-required-box-paid');
                }
            }
        }
    },


    /**
     * Show and hide overlaid box
     *
     * @param {String} boxId
     */
    manageLoginBox: function(boxId)
    {
        var loginBox = $(boxId);
        if (null !== loginBox) {
            loginBox.setStyle({display: 'block'});
            var closeButton = loginBox.select('.ui-popup-brown-close')[0];
            if ('undefined' !== typeof closeButton) {
                Event.observe(closeButton, 'click', function(event) {
                    loginBox.hide();
                    Event.stop(event);
                });
            }
        }
    },

    /**
     * Get Extension Key button actions
     */
    onButtonFreeClick: function()
    {
        if (!$('licence-agreement-checkbox').up().hasClassName('ui-checkbox-checked')) {
            alert(this.acceptAgreementMsg);
        } else {
            var trackData = {
                success: true,
                extensionName: this.extensionName,
                extensionPrice: this.extensionPrice,
                editionTitle: this.editionTitle,
                channelVersion: null
            }
            this.licenseAgreementBox.hide();
            var extensionKeyInput = this.extensionKeyInput;
            if (this.hasPackageUploadedToChannel10 && this.hasPackageUploadedToChannel20) {
                var connectVersionSelect = $('connect-version-id');
                var magentoConnectVersion = connectVersionSelect.options[connectVersionSelect.selectedIndex].innerHTML;
                trackData.channelVersion = magentoConnectVersion;

                if (connectVersionSelect.getValue() == this.defaultConnectVersion) {
                    extensionKeyInput.value = this.extensionKey10;
                } else {
                    extensionKeyInput.value = this.extensionKey20;
                }

                $('magento-connect-version').innerHTML = magentoConnectVersion;

                Event.observe($('magento-connect-version-switch'), 'click', function(event){
                    Event.stop(event);
                    this.extensionKeyBox.hide();
                    this.licenseAgreementBox.setStyle({display: 'block'});
                }.bind(this));
            } else if (this.hasPackageUploadedToChannel10) {
                extensionKeyInput.value = this.extensionKey10;
                trackData.channelVersion = '1.0';
            } else if (this.hasPackageUploadedToChannel20) {
                extensionKeyInput.value = this.extensionKey20;
                trackData.channelVersion = '2.0';
            } else {
                trackData.success = false;
                alert('Package was not uploaded');
                //throw new Error('Package was not uploaded');
            }

            if (trackData.success) {
                gaTracker.trackGetExtensionKeyEvent(trackData);

                var mcTrackData = {
                    extensionId: this.extensionId,
                    versionId: this.versionId,
                    channelVersion: trackData.channelVersion,
                    editionId: this.editionTitle
                };
                mcTracker.trackGetExtensionKeyClick(mcTrackData);
            }

            this.extensionKeyBox.setStyle({display: 'block'});
        }
    },

    /**
     * Increase downloads count
     *
     * @param {integer} editionId
     * @param {string} landingUrl
     */
    downloadCounter: function(editionId, landingUrl)
    {
        new Ajax.Request(this.downloadCounterUrl, {
            method : 'post',
            parameters : {
                extensionId : this.extensionId,
                editionId : editionId,
                form_key: this.downloadCounterFormKey
            },
            onSuccess: function()
            {
                gaTracker.trackGetPaidExtensionEvent({
                    extensionName: this.extensionName,
                    extensionPrice: this.extensionPrice,
                    editionTitle: this.editionTitle,
                    landingUrl: landingUrl
                });
            }.bind(this)
        });
    }
});
