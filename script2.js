
const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get("v");

if (!videoId) {
    document.body.innerHTML = "<h3 style='font-family:sans-serif;'>Video NOT FOUND.</h3>";
} else {
    // Dinamik olarak iframe ekle
    const iframe = document.createElement("iframe");
    iframe.src = https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    document.body.appendChild(iframe);

    window.onYouTubeIframeAPIReady = function() {
        const player = new YT.Player(iframe, {
            events: {
                'onStateChange': function(event) {
                    if (event.data === YT.PlayerState.UNSTARTED || event.data === YT.PlayerState.PLAYING) {
                        // Yeni video ID’sini ana sayfaya gönder
                        window.parent.postMessage({ type: "videoChanged", videoId: player.getVideoData().video_id }, "*");
                    }
                }
            }
        });
    };

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
}
