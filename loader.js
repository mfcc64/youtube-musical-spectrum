
{
    let load_script = function(src) {
        const prefix = "https://mfcc64.github.io/youtube-musical-spectrum/";
        let script = document.createElement("script");
        script.async = false;
        script.src = prefix + src;
        document.head.appendChild(script);
    }

    load_script("codecs-wrapper.js");
    load_script("showcqt.js");
    load_script("script.js");
}
