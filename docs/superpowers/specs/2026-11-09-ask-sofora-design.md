# Ask Sofora

Ask Sofora helps visitors get answers in English and take the next step on the public website. It covers published information about loans, savings, membership, forms, downloads, office locations and ways to contact staff. Member accounts, application status lookup, and form submission inside chat are outside the first release.

## Visitor experience

A chat launcher opens a panel with four starter prompts: Find a loan, Join Sofora, Find a form, and Get directions. Visitors can also type a question and ask follow-ups. Answers are brief and link to the Sofora page that supports them or the form the visitor needs.

Use the current page and the conversation to resolve references. On the car loan page, “What documents do I need?” defaults to the car loan. On the home page, with no loan mentioned, ask which loan the visitor means. A product explicitly named by the visitor takes precedence over the current page.

When published information is missing, say which detail Sofora's site does not provide and offer a way to contact staff. Questions about submitted applications go directly to this handoff. Offer Contact Sofora and a call action based on published contact details. Show WhatsApp only after Sofora confirms the official number for that channel. The chat does not ask for an application reference, identity documents, or account details.

## Answer flow

The website sends the question, recent conversation context, and current page path to a server endpoint. The endpoint reads the same published website content the public app uses, selects the relevant product details, FAQ, contact information, or form entries, and uses those sources to compose an English answer. The site renders links from the matched source entries so the model cannot invent a form URL or contact destination.

Use Convex's public content as the source of truth so a portal edit is reflected on the next question. Include online forms and downloadable file links. Use the text inside a downloadable document only after Sofora has verified that the document is current and the extracted text is reliable. Keep the answer endpoint's data access limited to published content.

If the answer service is unavailable, show the existing website search and contact options. Bound request size and rate limit the public endpoint.

## Launch checks

- Ask about documents from the car loan page and from the homepage. Verify that the first answer uses the published requirements and offers the loan application, and the second asks which loan.
- Ask how to join as a group. Verify that the chat opens the Kafo form.
- Ask where the office is. Verify that the answer matches the published address and links to directions.
- Ask about an unpublished fee or opening time. Verify that the answer identifies the missing detail and offers contact options.
- Ask for the status of a submitted application. Verify that the chat routes to staff without asking for personal details. Check that WhatsApp appears only when the official number is configured.
- Change a published requirement in a development environment and ask about it again. Verify that the answer reflects the edit.
