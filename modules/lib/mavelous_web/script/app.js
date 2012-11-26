goog.provide('mavelous.app');

goog.require('goog.Uri');
goog.require('goog.base');
goog.require('goog.debug.Console');
goog.require('goog.net.jsloader');

$(function() {
  var c = new goog.debug.Console();
  c.setCapturing(true);

  var uri = new goog.Uri(window.location.href);

  var mavlinkAPI = new Mavelous.MavlinkAPI({ url: '/mavlink/' });
  /* If we see "offline" query parameter in the URL, enable offline
   * mode. */
  if (goog.isDef(uri.getParameterValue('offline'))) {
    mavlinkAPI.useOfflineMode();
  }

  /* Phonegap support: If we see debug=<identifier>, load the phonegap
   * script.  You can then debug at
   * http://debug.phonegap.com/client/#<identifier> */
  if (goog.isDef(uri.getParameterValue('debug'))) {
    var phonegap_script_url = ('http://debug.phonegap.com/target/' +
                               'target-script-min.js#' +
                               uri.getParameterValue('debug'));
    goog.net.jsloader.load(phonegap_script_url);
  }

  var pfdSettingsModel = new Mavelous.PFDSettingsModel();
  var pfdView = new Mavelous.PFDView({
    mavlinkSrc: mavlinkAPI,
    settingsModel: pfdSettingsModel,
    drawingid: 'pfdview',
    blockel: $('#pfdblock'),
    statel: $('#pfdstatus')
  });

  var guideModel = new Mavelous.GuideModel({ mavlinkSrc: mavlinkAPI });
  var guideAltView = new Mavelous.GuideAltitudeView({
    model: guideModel,
    input: $('#guidealt-input'),
    submit: $('#guidealt-submit'),
    text: $('#guidealt-text')
  });

  var leafletDroneIcon = new Mavelous.LeafletDroneIconModel();
  var leafletProviders = new Mavelous.LeafletProviders();

  var vehicle = new Mavelous.VehicleLeafletPosition({ mavlinkSrc: mavlinkAPI });
  var mapView = new Mavelous.LeafletView({ 
    vehicle: vehicle,
    provider: leafletProviders,
    vehicleIcon: leafletDroneIcon
  });

  var commStatusModel = new Mavelous.CommStatusModel({
    mavlinkSrc: mavlinkAPI
  });

  var packetLossModel = new Mavelous.PacketLossModel({
    mavlinkSrc: mavlinkAPI
  });

  var commStatusButtonView = new Mavelous.CommStatusButtonView({
    commStatusModel: commStatusModel,
    packetLossModel: packetLossModel,
    el: $('#navbar-btn-link')
  });

  var gpsButtonView = new Mavelous.GpsButtonView({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-gps')
  });

  var statustextView = new Mavelous.StatustextView({ mavlinkSrc: mavlinkAPI });

  var modeStringView = new Mavelous.ModeStringView({
    mavlinkSrc: mavlinkAPI,
    el: $('#pfd_modestringview')
  });

  var flightModeModel = new Mavelous.FlightModeModel({
    mavlinkSrc: mavlinkAPI
  });
  var flightCommandModel = new Mavelous.CommandLongModel({
    mavlinkSrc: mavlinkAPI
  });
  var flightModeButtonView = new Mavelous.FlightModeButtonView({
    el: $('#navbar-btn-mode'),
    modeModel: flightModeModel,
    commandModel: flightCommandModel
  });

  /* Radio view controller */
  var statusButtons = new Mavelous.StatusButtons({
    buttons: [gpsButtonView, commStatusButtonView, flightModeButtonView]
  });


  var batteryButton = new Mavelous.BatteryButton({
    mavlinkSrc: mavlinkAPI,
    el: $('#navbar-btn-battery')
  });

  var settingsView = new Mavelous.SettingsView({
    /* Map settings: */
    map:               mapView.map,
    mapProviderModel:  leafletProviders,
    vehicleIconModel:  leafletDroneIcon,
    modalToggle:       $('#navbar-a-settings'),
    modal:             $('#settings-modal'),
    mapProviderPicker: $('#settings-mapproviderpicker'),
    mapZoomSlider:     $('#settings-mapzoom'),
    mapZoomValue:      $('#settings-mapzoom-value'),
    vehicleIconPicker: $('#settings-vehicleiconpicker'),
    /* PFD settings: */
    pfdSettingsModel: pfdSettingsModel,
    pfdPositionLeft: $('#settings-pfdpos-left'),
    pfdPositionRight: $('#settings-pfdpos-right'),
    pfdPositionUp: $('#settings-pfdpos-up'),
    pfdPositionDown: $('#settings-pfdpos-down')
  });

  window.router = new Mavelous.AppRouter({
    pfdSettingsModel: pfdSettingsModel
  });

  Backbone.history.start();

  if ($(window).width() > 767) {
    /* On the desktop, default to overview */
    router.navigate('overview', {trigger: true});
  } else {
    /* On tablets and phones, default to map only */
    router.navigate('maponly', {trigger: true});
  }

  setInterval(function() {
    mavlinkAPI.update();
  }, 100);


});
