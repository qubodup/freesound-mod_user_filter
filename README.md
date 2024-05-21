# freesound-mod_user_filter
Compact &amp; Ignored Users in Freesound Moderation

## what it looks like

> ![basic usage animation](https://raw.githubusercontent.com/qubodup/freesound-mod_user_filter/main/freesound-mod_user_filter_preview.gif)
<br>(names and profile pictures are censored)

## what it does

Compacts users and lets you filter them
* Minimizes information clutter in user boxes and adds a border
* Adds (unstyled) radio button filter at the top
* Adds favorite/ignore button for each user
* Information is stored in localStorage, will be lost when clearing cache etc and cannot yet be backed up
* UX enhancement: Clicking outside a modal closes it, you don't have to pixel hunt the x

## how to install

1. Have Tampermonkey (Chrome) or Greasemonkey (Firefox) extension installed in your browser
2. Copy the text content of https://raw.githubusercontent.com/qubodup/freesound-mod_user_filter/main/freesound-mod_user_filter.js
3. Create a new script in the Tampermonkey/Greasemonkey extension
4. Paste the text (overwriting the defaults) and save
5. Navigate to https://freesound.org/tickets/moderation/ and enjoy

## warning

The "Assign all new sounds" button will assign ALL new sounds (even the ones not currently shown due to the filter). I recommend using middle-mouse clicks on user's "Assign" buttons to assign them in the background.

