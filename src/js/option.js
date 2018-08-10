var AutoLaunch = require('auto-launch');
var appLauncher = new AutoLaunch({name: 'FabMo Minder'});
opener = require('opener');
nconf = require('nconf');
parse_args = require('minimist');
gui = require('nw.gui');
process = require('process');

var tray;
var trayMenu;

function hideTray() {
    if(tray) {
        tray.remove();
        tray = null;
    }
}

function showTray(win) {
    if(tray) { return; }

    switch(process.platform) {
        case 'darwin':
            var trayTitle = '';
            var trayTooltip = 'FabMo Minder';
            var trayIcon = './images/fabmo-icon-18x18.png';
            break;
        default:
            var trayTitle = 'FabMo Minder';
            var trayTooltip = 'The FabMo Minder service is still running. click to reopen';
            var trayIcon = './images/fabmo-icon.png';
            break;
    }

    // Show tray
    tray = new gui.Tray({
        title: trayTitle,
        tooltip: trayTooltip,
        icon: trayIcon
    });

    tray.menu = trayMenu;
    // Show window and remove tray when clicked
    tray.on('click', function() {
        win.show();
        this.remove();
        tray = null;
    });
}


global.cmd_line_args = {};
nconf.use('file', { file: gui.App.dataPath+'/settings.json' });



gui.App.on('open', function(cmdline) {
  var args = cmdline.split(" ").slice(1);
  if (args[0]==="."){ // avoid bug while running from source.
    args.shift();
  }
    if(args[0]===undefined){
        gui.Window.get().focus();
        return;
    }
  global.cmd_line_args = parse_args(args);
  window.location.reload();
  window.location = "./launch_file.html";
});

if(gui.App.argv){
    global.cmd_line_args = parse_args(gui.App.argv);
    if( !global.fileTransmittedViaArgv && gui.App.argv.length >= 1 && gui.App.argv[0]){
        global.fileTransmittedViaArgv = true;
        window.location.reload();
        window.location = "./launch_file.html";
    }

}

function init_options(){
  var win = gui.Window.get();
  trayMenu = new gui.Menu();

  // Show Minder
  switch(process.platform) {
      case 'darwin':
          var menuItemShow = new gui.MenuItem({
              type: 'normal',
              label: 'Show Minder'
          });
          menuItemShow.on('click', function() {
              win.restore();
              win.focus();
          });
          trayMenu.append(menuItemShow);
          break;
  }

  // Exit
  var menuItemExit = new gui.MenuItem({
      type: 'normal',
      label: 'Exit'
  });
  menuItemExit.on('click', function() {
      win.close(true);
  });
  trayMenu.append(menuItemExit);

  // Get the close event
  win.on('close', function() {
      if(nconf.get('tray:reduce_on_close')){
          win.hide();
          showTray(this);
      }else{
          win.close(true);
      }
  });

  // Get the minimize event
  win.on('minimize', function() {

      if(nconf.get('tray:reduce_on_minimize')){
          // Hide window
          win.hide();
          showTray(this);
      } else{
         // do noting act like the normal behavior
      }
  });

  win.on('focus', function() {
      hideTray();
  });

  $('.settings_modal').easyModal({"overlayClose":false});
  $('.easy-modal-open').click(function(e) {
      var target = $(this).attr('href');
      $(target).trigger('openModal');
      e.preventDefault();
  });

  $('.easy-modal-close').click(function(e) {
      $('.easy-modal').trigger('closeModal');
  });

  $(".easy-modal").on('openModal',function(e){
      $(".settings_save_button").removeClass("error_button done_button").addClass("pure-button-disabled");
      $(".settings_save_button").text("Save");
      //load settings config

      $("#min_tray_action").prop("checked",nconf.get('tray:reduce_on_minimize'));
      $("#close_tray_action").prop("checked",nconf.get('tray:reduce_on_close'));
      $("#startup_action").prop("checked",nconf.get('startup:launch_on_startup'));
    });


  $(".settings_save_button").click(function(e){
      if($(this).hasClass('pure-button-disabled')) {
          return;
      }

      nconf.set('tray:reduce_on_minimize', $("#min_tray_action").prop("checked"));
      nconf.set('tray:reduce_on_close', $("#close_tray_action").prop("checked"));
      nconf.set('startup:launch_on_startup', $("#startup_action").prop("checked"));

      if(nconf.get('startup:launch_on_startup')){
          appLauncher.enable(function(err){
              if(err){
                  //alert("Error enabling the auto-launch on startup: "+err);
              }
          });
      }else{

          appLauncher.disable(function(err){
              if(err){
                  //alert("Error disabling the auto-launch on startup: "+err);
              }
          });
      }

      $(".settings_save_button").addClass("pure-button-disabled");
      // Save the configuration object to disk
      nconf.save(function (err) {
          if(err){
              alert("Error saving the configuration : "+err);
              $(".settings_save_button").addClass("error_button");
              $(".settings_save_button").text("Error");
          }else{
              $(".settings_save_button").addClass("done_button");
              $(".settings_save_button").text("Done");
          }
          $('.easy-modal').trigger('closeModal');
      });
    });
}

$(".settings_input").click(function(e){
  // enable Save button only when an input changed
  $(".settings_save_button").removeClass("pure-button-disabled error_button done_button");
  $(".settings_save_button").text("Save");
});

function open_link(link){
  opener(link);
}
