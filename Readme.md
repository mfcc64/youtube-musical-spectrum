# YouTube Musical Spectrum

[YouTube Musical Spectrum](https://chrome.google.com/webstore/detail/youtube-musical-spectrum/ddpceafiohdlkiemibjgplcicblnfggi) is a Chrome
extension that offers audio visualization on your YouTube page with nice musical notes. It allows you to see waterfall of spectrogram
nicely.

## Install

Install [YouTube Musical Spectrum on Chrome Web Store](https://chrome.google.com/webstore/detail/youtube-musical-spectrum/ddpceafiohdlkiemibjgplcicblnfggi).

## Screenshots

![screenshot](screenshots/00.jpg)

![screenshot](screenshots/01.jpg)

![screenshot](screenshots/02.jpg)

![screenshot](screenshots/03.jpg)

![screenshot](screenshots/04.jpg)

## Settings

If you want to change the settings, click the ![Settings](icon-24.png) icon on the top left corner of your YouTube page
to access the menu, or if it is invisible, press Ctrl+Alt+H. Subsequent click to the ![Settings](icon-24.png) icon
will toggle the menu's visibility. On the other hand, subsequent Ctrl+Alt+H key will toggle the menu's visibility and
the ![Settings](icon-24.png) icon's visibility.

The available settings:
- **Height:** Set the height of the visualizer relative (in percents) to the height of the page. The value is between `20` and `100`.
  The default value is `33`. Setting it to `100` make the visualizer cover the page entirely.
- **Bar:** Set the bar's height. The value is between `3` and `33`. The default value is `17`.
- **Waterfall:** Set the waterfall's height relative (in percents) to the page's height. The value is between `0` and `40`.
  The default value is `33`. Setting it to `0` make the waterfall invisible.
- **Brightness:** Set the brightness of the visualizer. The value is between `7` and `49`. The default value is `17`.
- **Bass:** Set the bass attenuation in dB. The value is between `-50` and `0`. The default value is `-30`.
- **Speed:** Set the speed of the waterfall. The value is between `1` and `12`. The default value is `2`.
  Without frame drops, the speed of the waterfall is `speed * monitor_refresh_rate / interval` pixels/s.
- **Interval:** Set the frame rate interval. The value is between `1` and `4`. The default value is `1`.
  Without frame drops, the frame rate of the visualizer is `monitor_refresh_rate / interval`. This is a useful option
  on a high refresh rate monitor (e.g 240 Hz monitor).
- **Transparent:** Set the transparency of the visualizer. The default value is set to `true`.
- **Visible:** Set the visibility of the visualizer. The default value is set to `true`.
- **Reset Settings:** Reset settings to the default values (Note that the default values can be changed).
- **Set as Default Settings:** Set the current setttings as the default settings. Subsequent `Reset Settings` or new pages
  will load these settings.
- **Reset Default Settings:** Reset the default settings to the value in this documentation. Subsequent `Reset Settings`
  or new pages will load these settings in this documentation.

  
