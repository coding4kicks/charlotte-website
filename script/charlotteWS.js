// Assumes global namespace incudes:
//     $ browser, $, and alert

// Load utility functions in a protected namespace
var cjUtil = {

    // Function to swap visible main page content.
    swapContent: function (name) {
        "use strict";

        // Determine current content and make it invisible.
        $("#page div.showing").removeClass("showing");

        // Show new content.
        $("#" + name).addClass("showing");
        $(".current-quote").css("display", "block"); // NEEDS REFACTORING IN CSS
    },

    // Show extra content as overlay.
    //  - Labeled in HTML by class="overlay-content"
    overlayContent: function (name) {
        "use strict";

        // Create id and retieve overlay content div
        var oOverlay = $("#" + name + "-content");

        // Set overlays visible.
        $("#overlays").css("display", "block");
        oOverlay.css("display", "block");

        // Animate opacity change.
        $("#overlays").animate({opacity: 1.0}, 800);
    },

    // Funtion to exit overlay content.
    overlayContentExit: function (overlayID) {
        "use strict";

        // Hide overlays and change back opacity
        $("#overlays").css("display", "none");
        $("#overlays").css("opacity", "0.1");
        $(overlayID).css("display", "none");
    },

    // Ajax Loaded Pages' Navigation - Click Binding
    bindPage: function (appendID) {
        "use strict";

        $(appendID + " p a").map(function () {

            // Bind the overlays.
            if ($(this).hasClass("overlay")) {
                $(this).bind("click", function (event) {
                    cjUtil.overlayContent(this.title);
                    // Don't follow the link
                    event.preventDefault();
                    // No pushing state for overlays
                });
            } else {  // Bind other links
                $(this).bind("click", function (event) {
                    cjUtil.swapContent(this.title);
                    // Don't follow the link
                    event.preventDefault();
                    // Push the state to history
                    history.pushState("", "", this.title + ".html");
                });
            }
        });
    },

    // Retrieve other than home page content and attach bindings
    retrieveContent: function () {
        "use strict";

        // Retrieve content for all siblings of home-content div
        $("#page > div").map(function () {

            var urlPath     =   "content/" + this.id + "-content.html",
                appendID    =   "#" + this.id,
                location    =   String(document.location);

            // Don't retrieve content if already loaded.
            if (location.indexOf(this.id) !== -1) { return; }

            // Don't load two pages on initial Domain load.
            // Bind the links on index then return
            if (location === "http://www.charlottejacobs.net/" && this.id === "index") {
                cjUtil.bindPage("index");
                return;
            }

            // AJAX call for content
            $.ajax({
                url: urlPath,
                dataType: "html"

            // On retrieval...
            }).done(function (html) {

                // Add the content.
                $(appendID).append(html);

                // Bind the page links for the about and index pages
                if (appendID === "#about" || appendID === "#index") {
                    cjUtil.bindPage(appendID);
                }

            }).fail(function () {alert("Error Loading Site:" + appendID); });
        });

        // Retrieve overlay information
        $("#overlays div").map(function () {

            var urlPath     =   "content/" + this.id + ".html",
                appendID    =   "#" + this.id;

            // AJAX call for content
            $.ajax({
                url: urlPath,
                dataType: "html"

            // On retrievel add content.
            }).done(function (html) {

                // Add the exit button
                $(appendID).append("<div class='exit-button'><a><em>Exit</em></a></div>");

                // Bind the exit button for CLICK events
                $(appendID + " div a").bind("click", function () {
                    cjUtil.overlayContentExit(appendID);
                });

                // Add the content.
                $(appendID).append(html);

            }).fail(function () { alert("Error Loading Content"); });
        });
    },

    // Function to swap quotes on Kaplan page
    swapQuotes: function () {
        "use strict";

        // Get the current div and the next div.
        var currentQuote    =   $("#kaplan-quotes div.current-quote"),
            nextQuote       =   currentQuote.next();

        if (nextQuote.length === 0) {
            nextQuote = $("#kaplan-quotes div:first");
        }

        // Fade out the current div.
        currentQuote.fadeOut();
        nextQuote.fadeIn();
        currentQuote.removeClass("current-quote");
        currentQuote.css("display", "none");

        // Fade in the next div.
        nextQuote.addClass("current-quote");
    },

    // Reload previous content upon user pushing the backbutton
    backButton: function () {
        "use strict";

        var name,
            parts,
            location = String(document.location);

        // Make sure navigating on site
        if (location.indexOf("jacobs") !== -1) {

            // Use end of path for item to swap
            parts = location.split("/");
            name = parts[parts.length - 1];
            name = name.slice(0, -5);
            cjUtil.swapContent(name);
        }
    },

    // Select contact text
    // http://stackoverflow.com/questions/985272/jquery-selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
    selectText: function (element) {
        "use strict";

        var doc = document, range, selection,
            text = doc.getElementById(element);

        if (doc.body.createTextRange) { // ms
            range = doc.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) { // moz, opera, webkit
            selection = window.getSelection();
            range = doc.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};


// Set up bindings and retrieve content onload.
$(function () {
    "use strict";

    var swapContent     =   cjUtil.swapContent,
        retrieveContent =   cjUtil.retrieveContent,
        swapQuotes      =   cjUtil.swapQuotes,
        backButton      =   cjUtil.backButton,
        popped          =   window.history.state,
        initialURL      =   location.href;

	// Sidebar navigation - Click Binding 
	$("#sidebar a").map(function () {
		$(this).bind("click", function (event) {

            // Swap the content
			swapContent(this.title);

            // Don't follow the link.
            event.preventDefault();

            // Push the state to history.
            history.pushState("", "", this.title + ".html");
		});
	});

    // Display contact information on click, hide from scrapers
    $("#contact").bind("click", function () {

        var con, t, act, contact, contactDiv;

        // Create contact info from parts
        con = "charlotte";
        t = "@";
        act = "charlottejacobs.net";
        contact = con + t + act;

        // Ensure contact only appended once
        contactDiv = $("#contact-info");
        if (!contactDiv[0]) {
            $("#container").append("<span id='contact-info'>" + contact + "</span>");
        }

        // Highligh contact info
        cjUtil.selectText("contact-info");
    });

	// Sidebar navigation - Mouse Over Binding
	$("#sidebar a").map(function () {
		$(this).bind("mouseover", function () {
			$(this).addClass("highlight");
		});
	});

	// Sidebar navigation - Mouse Out Binding
	$("#sidebar a").map(function () {
		$(this).bind("mouseout", function () {
			$(this).removeClass("highlight");
		});
	});

    // Bind links on pages if already loaded
    cjUtil.bindPage("#index");
    cjUtil.bindPage("#about");

    // Retrieve all non-home-page content
    retrieveContent();

    // Set interval for swapping quotes on Kaplan page
    setInterval(swapQuotes, 5000);

    // Bind popstate function, prevent from firing initially
    $(window).bind("popstate", function (event) {

        var initialPop = !popped && location.href === initialURL;
        popped = true;
        if (initialPop) { return; }
        backButton(event);
    });
});
