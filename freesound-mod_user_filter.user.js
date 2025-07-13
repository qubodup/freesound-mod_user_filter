// ==UserScript==
// @name         Compact & Ignored Users in Freesound Moderation 2025
// @namespace    https://qubodup.github.io/
// @version      2025-07-14
// @description  Reduce burnout
// @author       qubodup
// @match        https://freesound.org/tickets/moderation/
// @match        https://freesound.org/tickets/moderation/?*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require      https://gist.githubusercontent.com/arantius/eec890c9ce4ff2f7abee896c0bba664d/raw/14bb06f60ba6dc12c0bc72fe4c69443f67ff26de/gm-addstyle.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...

    // close modal by clicking outside of it https://stackoverflow.com/a/37573735/188159
    $('body').click(function (event) {
        if(!$(event.target).closest('.modal-content').length && $(event.target).is('.modal-wrapper')) {
            $("div.modal-header > span.close").click();
        }
    });

    // localStorage
    var fsmciu = {}

    // localStorage
    function localSave() {
        localStorage.fsmciu = JSON.stringify(fsmciu);
    }

    function localLoad() {
        if ( localStorage.fsmciu === undefined ) {
            fsmciu = {};
        }
        else {
            fsmciu = JSON.parse(localStorage.fsmciu);
        }
        // complicated for in-dev new values
        if ( fsmciu.prefer === undefined ) fsmciu.prefer = [];
        if ( fsmciu.ignore === undefined ) fsmciu.ignore = [];
        if ( fsmciu.filter === undefined ) fsmciu.filter = 'all';
    }

    function userAdd(name, array) {
        let index = array.indexOf(name);
        if (index == -1) array.push(name);
    }

    function userRemove(name, array) {
        let index = array.indexOf(name);
        if (index !== -1) array.splice(index, 1);
    }

    // https://stackoverflow.com/a/2587356/188159
    jQuery.fn.cleanWhitespace = function() {
        this.contents().filter(
            function() { return (this.nodeType == 3 && !/\S/.test(this.nodeValue)); })
            .remove();
        return this;
    }

    localLoad();

    // CSS
    GM_addStyle(`.fsmciu_item { background-color: white; }
                 .fsmciu_item .start { border-width: 1px 1px 0 1px; border-style: solid; border-color: #ddd; border-radius: 12px 12px 0 0; padding-bottom: 8px; }
                 .fsmciu_item .btn-inverse { padding: 8px 12px; letter-spacing: 0; border-color: #ddd; transition: none; width: 100%; text-align: center; }
                 .fsmciu_item .btn-inverse:nth-child(1) { border-radius: 0 0 0 12px; border-right-width: 0; width: 60% }
                 .fsmciu_item .btn-inverse:nth-child(2) { border-radius: 0; border-right-width: 0; width: 20%; }
                 .fsmciu_item .btn-inverse:nth-child(3) { border-radius: 0 0 12px 0; width: 20%; }
                 .fsmciu_item .v-spacing-top-2.padding-bottom-5.center { margin-top: 0; }
                 .fsmciu_item .fsmciu_notes-none { color: #ddd; }
                 .fsmciu_item .fsmciu_notes-any { color: black; background-color: yellow; }
                 .fsmciu_item img.avatar, .fsmciu_item .no-avatar { border-radius: 11px 0 0 0; }
                 .fsmciu_item > div.start > div.padding-left-3 { overflow: hidden; text-overflow: ellipsis !important; }
                 .fsmciu_item a { transition: none; }
                 .fsmciu_item.fsmciu_prefer .start { background: linear-gradient(45deg, white 85%, lightgreen 85%); }
                 .fsmciu_item.fsmciu_ignore .start { background: linear-gradient(45deg, white 85%, lightgrey 85%); }
                 .fsmciu_item.fsmciu_prefer .fsmciu_toggle_prefer,
                 .fsmciu_item.fsmciu_ignore .fsmciu_toggle_ignore { color: white; background-color: grey; }
                 .fsmciu_item.fsmciu_hidden, .fsmciu_button_hiddern { display: none; }
                 .fsmciu_ticket {  }
                 .fsmciu_assign_all { color: grey; background-color: white; border: 1px solid grey; margin: auto 20px auto 0; }
                 .fsmciu_assign_visible1new { color: grey; background-color: white; border: 1px solid grey; margin: auto 0 auto 20px; }
                 .fsmciu_iframe { width:25%; height:25px; float: left; }
                 .fsmciu_clear { clear: both; }
                 .fsmciu_assigned > div { background-color: silver; }
                 `);

    // each user item
    $('body > div.bw-page > div > div > div.col-12.no-paddings.v-spacing-5 > div:nth-child(4) > div.row.v-spacing-top-4 > div').each(function(){
        $(this).addClass('fsmciu_item');

        var name_ele = $(this).find('a')[0];
        var name = $(name_ele).text();
        var new_ele = $(this).find('a')[1];
        var new_count = $(new_ele).text().split(' ')[0];
        var modnotes_ele = $(this).find('a')[2];
        var modnotes_count = $(modnotes_ele).text().trim().split(' ')[0];
        var days_ele = $(this).find('span.text-grey')[0];
        var days_count = $(days_ele).text().split(' ')[0];
        var allsounds_ele = $(this).find('span.text-grey')[1];
        var allsounds_count = $(allsounds_ele).text().split(' ')[0];

        var bottom_bar = $(this).find('div.v-spacing-top-2.padding-bottom-5.center > a');

        $(name_ele).addClass('fsmciu_userlink');
        if ( fsmciu.prefer.includes(name) ) { $(this).addClass('fsmciu_prefer'); }
        else if ( fsmciu.ignore.includes(name) ) { $(this).addClass('fsmciu_ignore'); }

        // reformat new sounds and all sounds count
        $(new_ele).text( $(new_ele).text().replace(/unassigned sounds?/,'new').trim() );
        $(allsounds_ele).text( ' / ' + $(allsounds_ele).text().replace(/uploaded sounds?/,'all') );
        $(allsounds_ele).insertAfter($(new_ele));

        // single out single uploads
        if ($(new_ele).text().split('new')[0] == '1 ') {$(this).addClass('fsmciu_solosound');}

        // reformat days / notes count
        $(days_ele).text( $(days_ele).text().replace(/ days? in queue/,'d / ') );
        $(modnotes_ele).find('span[class^="annotation-label"').text( $(modnotes_ele).find('span[class^="annotation-label"').text().replace('mod annotation','note') );
        if ( parseInt(modnotes_count) == 0 ) { $(modnotes_ele).addClass('fsmciu_notes-none'); } else { $(modnotes_ele).addClass('fsmciu_notes-any'); }
        $(modnotes_ele).insertAfter($(days_ele));

        // saved one line
        $(this).find('br')[2].remove();

        // restyle assign button
        $(this).find('a.btn-inverse.no-hover').text('Assign');
        $(this).find('span.bw-icon-plus').removeClass('bw-icon-plus');

        // add/toggle/remove prefer (favorite)/block buttons
        $(bottom_bar).after('<a title="favorite" class="btn-inverse no-hover fsmciu_toggle_prefer" href="javascript:void(0);">★</a><a title="ignore" class="btn-inverse no-hover fsmciu_toggle_ignore" href="javascript:void(0);">🛇</a>');
        $(this).find('.fsmciu_toggle_prefer').click(function(){
            // already added
            if ( $(this).parent().parent().hasClass('fsmciu_prefer') ) {
                $(this).parent().parent().removeClass('fsmciu_prefer');
                userRemove(name, fsmciu.prefer);
            } else {
                $(this).parent().parent().removeClass('fsmciu_ignore');
                $(this).parent().parent().addClass('fsmciu_prefer');
                userAdd(name, fsmciu.prefer);
                userRemove(name, fsmciu.ignore);
            }
            localSave();
        });
        $(this).find('.fsmciu_toggle_ignore').click(function(){
            // already added
            if ( $(this).parent().parent().hasClass('fsmciu_ignore') ) {
                $(this).parent().parent().removeClass('fsmciu_ignore');
                userRemove(name, fsmciu.ignore);
            } else {
                $(this).parent().parent().removeClass('fsmciu_prefer');
                $(this).parent().parent().addClass('fsmciu_ignore');
                userAdd(name, fsmciu.ignore);
                userRemove(name, fsmciu.prefer);
            }
            localSave();
        });

    });
    // each user item DONE

    // filter
    $('body > div.bw-page > div > div > div.col-12.no-paddings.v-spacing-5 > div:nth-child(4) > form > div > div.select-dropdown.select-dropdown--0').after(`<div style="display: inline-block;">
	<span>filter:</span>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_all" value="all">
	<label name="fsmciu_filter" for="fsmciu_filter_all">all</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_noignore" value="noignore">
	<label name="fsmciu_filter" for="fsmciu_filter_noignore">noignore</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_onlyfav" value="onlyfav">
	<label name="fsmciu_filter" for="fsmciu_filter_onlyfav">onlyfav</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_onlyignore" value="onlyignore">
	<label name="fsmciu_filter" for="fsmciu_filter_onlyignore">onlyignore</label>
	<input type="radio" name="fsmciu_filter" id="fsmciu_filter_onlyundecided" value="onlyundecided">
	<label name="fsmciu_filter" for="fsmciu_filter_onlyundecided">onlyundecided</label>
    <a id="fsmciu_save" href="#" title="save local storage filter data to json file">save</a>
    <a id="fsmciu_load" href="#" title="load json file to local storage filter data">load</a>
</div>`);

    // save and load functionality

    function getTimestampFilename() {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        return `FreesoundIgnoredUsers-${timestamp}.json`;
    }

    function downloadJSON(obj, filename) {
        const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    function showAlert(msg, isError = false) {
        alert((isError ? '⚠️ ' : '✅ ') + msg);
    }

    document.getElementById('fsmciu_save').addEventListener('click', e => {
        e.preventDefault();
        localSave();
        downloadJSON(fsmciu, getTimestampFilename());
    });

    document.getElementById('fsmciu_load').addEventListener('click', e => {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = () => {
            const file = input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data || typeof data !== 'object') throw 'Invalid format';

                    // validate expected structure
                    if (!Array.isArray(data.prefer)) data.prefer = [];
                    if (!Array.isArray(data.ignore)) data.ignore = [];
                    if (typeof data.filter !== 'string') data.filter = 'all';

                    fsmciu = data;
                    localSave();
                    showAlert(`Loaded ${fsmciu.ignore.length} ignored, ${fsmciu.prefer.length} preferred users (reload the page please)`);
                } catch (err) {
                    showAlert('Failed to load JSON: corrupted or invalid file.', true);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // Filter

    function filterUsers() {
        if ( fsmciu.filter == 'all' ) {
            $('.fsmciu_item').removeClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'noignore' ) {
            $('.fsmciu_item').removeClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_ignore').addClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'onlyfav' ) {
            $('.fsmciu_item').addClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_prefer').removeClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'onlyignore' ) {
            $('.fsmciu_item').addClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_ignore').removeClass('fsmciu_hidden');
        } else if ( fsmciu.filter == 'onlyundecided' ) {
            $('.fsmciu_item').removeClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_ignore').addClass('fsmciu_hidden');
            $('.fsmciu_item.fsmciu_prefer').addClass('fsmciu_hidden');
        }
    }

    // click default filter
    $('input[type="radio"][value="' + fsmciu.filter + '"]').click();

    $("input[name='fsmciu_filter']").change(function() {
        let filter = $("input[type='radio'][name='fsmciu_filter']:checked").val();
        if (filter == fsmciu.filter) { return; } // stop wasting time
        fsmciu.filter = filter;
        filterUsers();
        localSave();
    })

    // mark "+ assign all new sounds to me" button as dangerous
    let assign_all = $('body > div.bw-page > div > div > div.col-12.no-paddings.v-spacing-5 > div:nth-child(4) > div.v-spacing-top-4.center > a[href="/tickets/moderation/assign/new/"]');
    $(assign_all).html('<span class="bw-icon-plus"> </span>Assign all*');
    //$(assign_all).prop('href', 'javascript:void(0);');
    $(assign_all).prop('title', 'Assigns ALL unassigned sound tickets, both visible and invisible/filtered—YOU HAVE BEEN WARNED');
    $(assign_all).addClass('fsmciu_assign_all');
    $(assign_all).click( function(e) {
        if (!confirm('Assign all sound tickets, even if they are invisible (filtered out)?')) e.preventDefault();
    });

    // add "assign visible" button
    let fsmciu_assign_visible = $(assign_all).after('<a href="javascript:void(0);" class="btn-primary no-hover fsmciu_assign_visible" title="Assigns all currently visible users\' tickets by opening each assignment link in an iframe"><span class="bw-icon-plus "> </span>Assign only visible</a>');

    // add 'assign visible "1 new"' button
    let fsmciu_assign_visible1new = $(fsmciu_assign_visible).parent().append('<a href="javascript:void(0);" class="btn-primary no-hover fsmciu_assign_visible1new" title="Assigns all currently visible users\' tickets with only one new sound by opening each assignment link in an iframe"><span class="bw-icon-plus "> </span>Assign visible "1 new"</a>');

    // add assignment iframe container
    $(fsmciu_assign_visible1new).parent().after('<div class="fsmciu_iframes"></div>');

    // assign all visible interaction
    $('.fsmciu_assign_visible').click(function() {
        $('.fsmciu_item:not(.fsmciu_hidden):not(.fsmciu_assigned)').each( function() {
            $(this).addClass('fsmciu_assigned');
            let assign_url = $(this).find('a[href^="/tickets/moderation/assign/"').attr('href');
            $('.fsmciu_iframes').append('<iframe class="fsmciu_iframe" src="' + assign_url + '" /></iframe>');

        });
        if ($('.fsmciu_clear').length == 0) {
            $('.fsmciu_iframes').append("<div class='fsmciu_clear'>No need to wait for the iframes. You can try <a href='" + $('.nav-link[href^="/tickets/moderation/assigned/"]').prop('href') + "'>moderating</a> immediately.</div>");
        }
    });

    // assign all visible with only 1 new sound interaction
    $('.fsmciu_assign_visible1new').click(function() {
        $('.fsmciu_item:not(.fsmciu_hidden):not(.fsmciu_assigned).fsmciu_solosound').each( function() {
            $(this).addClass('fsmciu_assigned');
            let assign_url = $(this).find('a[href^="/tickets/moderation/assign/"').attr('href');
            $('.fsmciu_iframes').append('<iframe class="fsmciu_iframe" src="' + assign_url + '" /></iframe>');

        });
        if ($('.fsmciu_clear').length == 0) {
            $('.fsmciu_iframes').append("<div class='fsmciu_clear'>No need to wait for the iframes. You can try <a href='" + $('.nav-link[href^="/tickets/moderation/assigned/"]').prop('href') + "'>moderating</a> immediately.</div>");
        }
    });

    // initial filter
    filterUsers();

    // ticket cleanup

    function ticketsClean() {
        // for each ticket box
        $('div:not(.fsmciu_ticket) > div.v-spacing-top-2.text-grey > div > a[href^="/tickets/"]').parent().parent().parent().each(function(){

            // add class to tickets
            $(this).addClass('fsmciu_ticket');

            // minimize clutter
            let ticket_link = $(this).find('div > div > a[href^="/tickets/"]');
            let ticket_text = $(ticket_link).find('span.text-grey');
            let ticket_icon = $(ticket_text).find('span.bw-icon-file-text');
            let ticket_text_content = $(ticket_text).text().trim().replace(':', '');

            // add ticket text to title of icon
            let ticket_text_wrap = $(ticket_text).contents().eq(1).wrap('<span class="fsmciu_ticket_text" />').remove();
            $(ticket_icon).prop('title', ticket_text_content);

            // remove ticket text
            $(ticket_text_wrap).text('');

            // make time compact
            let ticket_time = $(this).find('div.v-spacing-top-2.text-grey > div:nth-child(2) > span.text-grey');
            $(ticket_time).text( $(ticket_time).text().replace(/ /g, '').replace(/ /g, '').replace(/years?/, 'Y').replace(/months?/, 'M').replace(/weeks?/, 'w').replace(/days?/, 'd').replace(/hours?/, 'h').replace(/minutes?/, 'm').replace(' ago', '') )
            $(ticket_time).parent().addClass('fsmciu_ticket_time');

            let ticket_assigned_line = $(this).find('div:nth-child(2) > div:nth-child(3)');
            let ticket_assigned = $(this).find('div:nth-child(2) > div:nth-child(3) > span:nth-child(1)');
            let ticket_message_wrap = $(this).find('div:nth-child(2) > div:nth-child(3)').contents().eq(3).wrap('<span class="fsmciu_ticket_message" />');
            let ticket_last_message = $(this).find('div:nth-child(2) > div:nth-child(4)');

            // make "Assigned to X" and "Unassigned" (with .bw-icon-notification) compact
            if ( $(ticket_assigned).text().startsWith('Assigned to ') ) {
                $(ticket_assigned).html('🔎︎ ' + $(ticket_assigned).text().split('Assigned to ')[1]);
            } else if ( $(ticket_assigned).text().trim() == 'Unassigned' ) {
                $(ticket_assigned)[0].childNodes[1].nodeValue = '';
                $(ticket_assigned).find('.bw-icon-notification').prop('title', 'Unassigned');
                $(ticket_assigned).find('.bw-icon-notification').text('');
            }
            // make "message" count compact
            $(this).find('.fsmciu_ticket_message').text( '✉ ' + $(ticket_message_wrap).text().split(' ')[0] );

            // make "Last message by X:" compact
            $(ticket_last_message).text( $(ticket_last_message).text().replace('Last message by ', '') );

            // combine date, assignee and message count
            $(ticket_assigned_line).prepend('<span class="h-spacing-left-1 h-spacing-1">·</span>');
            $(this).find('.fsmciu_ticket_time').append( $(ticket_assigned_line).html() );
            $(ticket_time).parent().cleanWhitespace(); // remove whitespace between elements
            $(ticket_assigned_line).remove();

            // make "I've uploaded X. Please moderate!" compact

        });

        // make this happen when new ticket links appear that have not the class in their parent yet.
        setTimeout(ticketsClean, 1000);
    }

    ticketsClean();

})();
