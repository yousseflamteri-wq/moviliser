---
title: Movie Title
year: 2024
runtime: 1h 30m
genre: Action, Sci-Fi
cast: Lead Actor, Supporting Actor, Another Actor
videoEmbedUrl: https://www.youtube.com/embed/your_video_id
---

Write the full synopsis of the movie here. This is the description the user will read on the full-screen details view before they click "Watch Now".

HOW IT WORKS:
• Everything between the `---` lines is the frontmatter (settings).
• Everything below the second `---` line is the synopsis.
• `title`: The display name of the movie.
• `year`: The release year (numbers only).
• `runtime`: The length of the movie (e.g., 2h 15m).
• `genre`: Comma-separated list of genres.
• `cast`: Comma-separated list of the main actors.
• `videoEmbedUrl`: Must be an EMBED link (like youtube.com/embed/...), not a standard watch link.

IMAGES:
• By default, the script looks in `/public/images/` for a `.jpg`, `.png`, or `.webp` file that exactly matches the `.md` filename (e.g., `metropolis.md` looks for `metropolis.jpg`).
• You can optionally add `image: custom-name.jpg` in the frontmatter if you want to override the default naming convention.

TO ADD A MOVIE: 
1. Copy this file and rename it (e.g., `night-of-the-living-dead.md`).
2. Fill in the frontmatter fields and the synopsis.
3. Put a matching poster image in `/public/images/`.
4. Commit and push.
