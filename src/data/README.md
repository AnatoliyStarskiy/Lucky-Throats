# Content Data Guide

All website content is edited in two files:

- `translations.json` -> interface texts (buttons, titles, FAQ, menu).
- `site-content.json` -> cards/lists (services and team).

---

## `translations.json` (grouped by blocks)

Now translations are split into clear blocks for easier editing.

Main blocks:

- `common`
- `navigation`
- `hero`
- `about`
- `manifesto`
- `cinema`
- `editorial`
- `services`
- `service_items`
- `locations`
- `location_cards`
- `purchase`
- `journey`
- `map`
- `team`
- `gallery`
- `reviews`
- `faq`
- `cta`
- `contact`
- `booking`
- `footer`

Each block contains old `data-i18n` keys, so the website keeps working without HTML changes.

Example:

```json
{
  "pt": {
    "hero": {
      "hero_title": "Cortes de precisao com assinatura Lucky Throats"
    }
  },
  "en": {
    "hero": {
      "hero_title": "Precision cuts with Lucky Throats signature"
    }
  }
}
```

### How to edit translations

1. Find the block you need (`hero`, `faq`, `team`, etc.).
2. Change text in `pt`.
3. Change matching text in `en`.
4. Do not rename keys (left side), only values (right side).

---

## `site-content.json` (services + team cards)

Use this file for card/list content that has its own structure.

### Services

Path: `services.items[]`

Per item:

- `group`: `core` or `detail`
- `price`
- `category.pt` / `category.en`
- `titleKey` / `descKey` (link to `translations.json`)

### Team

Path: `team.locations[]`

Per location:

- `key`
- `defaultBarberId`
- `barbers[]`

Per barber:

- `name`
- `role.pt` / `role.en`
- `description.pt` / `description.en`
- `skills.pt[]` / `skills.en[]`
- `image`
- `position`

---

## Final check after any edit

Run:

```bash
npm run build
```
