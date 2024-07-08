= Introduction
There can be a lot of thinking involved to justify some
feature design, which may not be obvious.

The goal here is to capture the essence of this thinking
to ease understanding and/or further analysis of the current
choices. This also exposes some corner-cases behavior that
may occur.

Justifications can be provided for both normal people (User)
and tech-savvy ones (Tech).

This file was created late in the project, so not everything
is (yet) properly documented/justified.

= Website vs. Smartphone App
== User
Main goal is to provide the ability to read text. A smartphone
isn't well suited for that purposes.

We can manage to have a usable-enough website for punctual needs
on small screen.

Tablets screen is big enough; buttons were originally added for
tablets users.

== Tech
RAS.

= Website vs. Browser extension
Browser extension is great for punctual use, but starts to become
problematic for texts analysis, as:

  1. Websites are often built differently. Fetching Chinese characters
  on a random website can be done, but is a bit fragile.

  2. Proper display is a little problematic too; we have much finer
  control through a Website.

We're likely to re-enable a browser extension later-on, with a similar
design to what the google-translate app provide (basically, opens a
new tab to translate/analyse the selected data).

= Tech
See ./ext/.

= No OOP
== User
RAS

== Tech
TODO

= React, Angular, View.js, etc.
== User
RAS.

== Tech
TODO

= TypeScript
== User
RAS.

== Tech
We merely used typescript's annotations.
TODO

= Patched dictionaries
== User
RAS.

== Corner-case
Tokenisation is performed using all the dictionaries referenced
in preferences. Thus, dictionaries used e.g. only for a navdict
and not for the main tabs will also be used to tokenize text.

This should barely happen in practice, nor causes a great deal
of trouble.

== Tech
We want to avoid executing JS code on the backend. Globally,
I have little confidence in the JS ecosystem given its high
rate of evolution; there's also the issue of installing e.g.
node on OpenBSD/an irregular OS.

We also want to avoid coding the same thing twice in two
different languages.

Using patch(1) like format would be too restricted (e.g. we'll
want to implement sourcing for patches to ease assessing data
quality) and inconvenient for non-tech savvy users.

We want to avoid implementing a dependancy management tool;
the patch chains are mostly a convenience; we don't want
recursive patch chains.

This also reduces (avoid?) the need to version files in case of
trouble in patch applications.

Current implementation allows "fine" adjustments, that we should
be able to individually source later on.

On the fly patching as currently implemented is likely to
ease user-based patches edition. This also makes clear how
the patch is constructed, e.g. helps clarifies the
cedict-singles entries.
