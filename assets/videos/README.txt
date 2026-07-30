Clips shown behind the "One more thing" toggle in the site footer.

Currently live:
  non-iphone-user.mp4   1280x720, 3:06, 14 MB
  filmy-keeda.mp4        400x224, 5:26,  6 MB

To swap one out, replace the file and keep the same name, or change the
<source src="..."> and the <figcaption> in index.html.

Both use preload="metadata": the browser fetches only the header so it can show
a real first frame as the thumbnail, instead of a black box. The video body is
not downloaded until a visitor presses play, so page speed is unaffected.

Keep each file under about 50 MB. GitHub blocks single files over 100 MB, and
large files stay in git history permanently even after deletion.
