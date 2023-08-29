# xspf2ffmeta

Usage: node . [playlist.xspf]

You can create an XSPF bookmarks file by opening videos in VLC, then hitting `Ctrl+B`.  Each time you click "Create", a new timestamp will be logged.  You can alter the description by single-clicking on it.  You can then go to `Media -> Save Playlist as File...`, and save an xspf file with those bookmarks in it.

When you then run this, each video in the playlist will have an associated `video.mp4.ffmeta` file, containing the chapter data.  You can mux these into your videos with the following:

```bash
ffmpeg -i video.mp4 -i video.mp4.ffmeta -c copy video.marked.mp4
```
