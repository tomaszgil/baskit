# Product Requirements Document (PRD)

**Product Name:** Baskit  
**Platform:** Mobile-optimized web application  
**Owner:** @tomaszgil
**Version:** v1.0

---

## 1. Overview

**Purpose:**  
Baskit helps users create and manage grocery shopping lists quickly and easily. It leverages predefined product lists and user-defined templates (e.g., meals) to simplify recurring shopping tasks.

**Goals:**

- Reduce effort in creating shopping lists.
- Allow easy template creation and re-use (e.g., “Pasta Dinner”).
- Provide a seamless mobile experience optimized for in-store use.
- Support list lifecycle from “draft” (editable) to “complete” (ready for shopping).
- Provide simple, intuitive interactions for adding/removing/checking products.

**Non-Goals (for v1):**

- Real-time collaboration/sharing with other users.
- Barcode scanning or integration with retailers.
- Recipe recommendation engine.

---

## 2. Target Users

- **Primary Users:** Busy individuals or families who frequently shop for groceries and want quick ways to generate lists.
- **Secondary Users:** Meal preppers, health-conscious users who track meals, and small households who shop frequently.

**User Needs:**

- Reuse common products.
- Quickly generate lists from “meals” or templates.
- Edit lists flexibly while shopping.
- Track which items have been picked up.

---

## 3. Key Features

### 3.1 Products (System-provided)

- **Data model:**
  - Name (string)
  - Unit: ml / g / piece
- Application provides a base list of frequently shopped products.

### 3.2 Templates (User-generated)

- **Attributes:**
  - Name (e.g., "Pasta Dinner")
  - Description (e.g., "Ingredients for a quick dinner")
  - Type: meal / template
  - List of products + quantity
- **Use case:** Templates allow users to quickly recreate recurring meal/product sets.
- **Create a template:**
  - Selecting a list of products + quantity
- **Edit template:**
  - Add or remove products.
  - Change product quantities.
  - Change type and name.

### 3.3 Shopping List (Create Mode)

- **Create a list by:**
  - Selecting a template + quantity multiplier → adds products with multiplied quantities.
  - Adding products manually.
- **Edit list:**
  - Add or remove products.
  - Change product quantities.
  - Add notes/description per item (e.g., “organic only”).
- **Persistence:**
  - All changes autosaved.
  - Status defaults to “draft”
- **Mark the list as ready:**
  - User can mark list as “ready”

### 3.4 Shopping List (Shopping Mode)

- **Access any list in "Ready" state.**
- **Check items off while shopping.**
- Mobile-optimized UI for one-handed use: large checkboxes.

---

## 4. User Flows

### 4.1 Creating a Template

1. Navigate to “Templates.”
2. Create new template → enter name, description, type.
3. Add products from provided list.
4. Save template.

### 4.2 Creating a Shopping List

1. Start new list.
2. Select a template and choose multiplier (e.g., “2 × Pasta Dinner”).
3. List is populated with products × quantity.
4. User edits list (add/remove/change/notes).
5. List is auto-saved with status “Draft.”

### 4.3 Completing a List

1. User finishes editing.
2. Marks list as “Ready.”
3. List is frozen, available for shopping mode.

### 4.4 Shopping with a List

1. User opens a completed list.
2. Scrolls through items.
3. Checks off items as purchased.
4. Can uncheck if mistakes are made.

---

## 5. Functional Requirements

- **FR1:** Application provides system-defined product list.
- **FR2:** Users can create templates with products and quantities.
- **FR3:** Users can create, edit, and save shopping lists.
- **FR4:** Users can complete shopping lists (status: complete).
- **FR5:** Users can use completed lists in “shopping mode” with checkboxes.
- **FR6:** All changes auto-save (draft mode).
- **FR7:** Mobile-first responsive design.

---

## 6. Non-Functional Requirements

- **Performance:** Lists should load in <1s on 4G.
- **Reliability:** Auto-save must prevent data loss during navigation.
- **Usability:**
  - Large, touch-friendly UI elements.
  - Minimal text entry required.
  - Dark mode support for in-store visibility (optional).
- **Compatibility:** Mobile-first, optimized for modern mobile browsers (Safari, Chrome, Firefox).

---

## 7. Future Enhancements (Not in v1)

- List sharing with other users.
- Barcode scanning or voice input for adding products.
- Recipe recommendations.
