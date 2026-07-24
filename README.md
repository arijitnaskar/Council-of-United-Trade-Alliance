# Council of United Trade Alliance Website

A responsive static website for the Council of United Trade Alliance, prepared for GitHub Pages.

## Structure

- `index.html` - Home
- `about.html` - About the Council
- `events.html` - Upcoming and past programmes
- `members.html` - News page with member network and membership information
- `notices.html` - Official notice area
- `resources.html` - Important official links
- `gallery.html` - Image gallery with lightbox
- `admin.html` - Private gallery upload helper for authorised admins
- `contact.html` - Contact information and enquiry form
- `privacy.html`, `terms.html` - Draft legal pages
- `assets/css/styles.css` - Shared responsive design system
- `assets/js/main.js` - Shared navigation, loader, forms, tabs, filters, and gallery behavior
- `assets/js/admin.js` - GitHub Pages gallery upload helper
- `assets/data/gallery.json` - Data source for admin-uploaded gallery items
- `assets/images/` - Logo and local image assets

## GitHub Pages

1. Push this folder to a GitHub repository.
2. Open repository **Settings > Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the publishing branch and the `/ (root)` folder.

All links are relative, so the site works on both user/organization pages and repository project pages.

## Gallery admin uploads

Open `admin.html` directly after deployment. The page can upload a photo to `assets/images/gallery/` and add its description to `assets/data/gallery.json` through the GitHub API.

Use a fine-grained GitHub token limited to this repository, with **Contents: Read and write** permission. Do not hard-code the token in any website file.

## Static form and membership download

The contact form prepares a pre-filled email to `unitedtradeallince@gmail.com`. Membership applicants download the official Word form from `assets/downloads/Membership Form.docx` and submit it to the Council Secretariat.

## Content still required before launch

- Approved office bearer and member profiles
- Official membership fees, rules, and application document list
- Approved event photographs and captions
- Confirmed office hours and exact map pin
- Approved legal policy text
- Current notices and downloadable documents

## Image credits

- Factory image: Syed Qaarif Andrabi, Unsplash
- Kolkata image: Unseen Histories, Unsplash
- Seminar speaker: ICS Media Production, Pexels
- Seminar audience: Luis Quintero, Pexels
- Hero image: generated specifically for this website
