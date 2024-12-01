# STIMS: Smart Tagged Inventory Management Software

- [STIMS: Smart Tagged Inventory Management Software](#stims-smart-tagged-inventory-management-software)
  - [Project Abstract](#project-abstract)
  - [Team Information](#team-information)
  - [Project Description](#project-description)
  - [Project Planning](#project-planning)
    - [User Stories](#user-stories)
    - [Design Diagrams](#design-diagrams)
      - [Design D0](#design-d0)
      - [Design D1](#design-d1)
      - [Design D2](#design-d2)
  - [Deliverables, Deadlines](#deliverables-deadlines)
    - [Task List](#task-list)
    - [Timeline](#timeline)
  - [ABET Concerns](#abet-concerns)
    - [Economic Constraints](#economic-constraints)
    - [Legal Constraints](#legal-constraints)
    - [Security Constraints](#security-constraints)
  - [PPT Slideshow](#ppt-slideshow)
    - [Presentation](#presentation)
    - [Video](#video)
  - [Self-assessment Essay](#self-assessment-essay)
  - [Professional Biography](#professional-biography)
  - [Budget](#budget)
  - [Appendix](#appendix)
    - [Further Reading](#further-reading)

## Project Abstract

STIMS, the Smart Tagged Inventory Management System, is a database driven storage catalog capable of adding and tracking any combination of real world items. This multi-modal storage paradigm is achieved through the use of many tagging systems, in comparison to other inventory databases using simply one for a specific type of physical media.

The goal of STIMS is to provide database administrators with the tools to easily catalog new items and even create new object types for tracking, while providing a streamlined search and recall dashboard for end-users to facilitate inventory check-in and check-out operations while maintaining database integrity and security throughout the whole process.

## Team Information

**Jack Margeson**

5th year Computer Science

e: [margesji@mail.uc.edu](mailto:margesji@mail.uc.edu)

l: [linkedin.com/in/jack-margeson/](https://www.linkedin.com/in/jack-margeson/)

w: [marg.es/on](https://marg.es/on)

[Professional Biography](<Jack Margeson - Professional Biography.md>)

**Dr. William Hawkins III**

Asst Professor, Project Advisor

e: [hawkinwh@ucmail.uc.edu](mailto:hawkinwh@ucmail.uc.edu)

w: [researchdirectory.uc.edu/p/hawkinwh](https://researchdirectory.uc.edu/p/hawkinwh)

## Project Description

The main area of focus for this project is creating and manipulating inventory databases to enable easy storage and retrieval of physical items through the implementation of a custom tagging system.

The project consists of a CRUD backend built in PostgreSQL and Node.js Express, with a front-end in Angular and TypeScript to utilize the power of inheritance to create different item structures. The Angular dashboard facilitates ease of use by end-users when performing database actions.

## Project Planning

### User Stories

> "As a person in certain role, I want to meet a certain goal so that I have some tangible benefit.“

1. As a general user, I want to be able to search and check in/out items from the inventory so that I can easily keep track of my transactions and maintain accurate stock records.

2. As a database administrator, I want to be able to create new item types in the inventory database so that I can accurately categorize and track a wide range of items.

3. As a database administrator, I want to be able to assign different tagging systems to item entries so that I can easily retrieve and identify items using various identification methods (such as ISBN, NFC, RFID, etc.).

### Design Diagrams

#### Design D0

![Design D0](project_planning/Design_Diagrams/design_d0.png)

#### Design D1

![Design D1](project_planning/Design_Diagrams/design_d1.png)

#### Design D2

![Design D2](project_planning/Design_Diagrams/design_d2.png)

## Deliverables, Deadlines

### Task List

For a status-updated task list, please view the [checklist](project_planning/Tasklist.md).

- Decide on object oriented language capable of interacting with database frameworks and also GUI creation
- Design user interface using sketches and prototyping
- Research database framework capable of handling schema with flexible types
- Create development environment for whatever language/framework chosen
- Implement GUI from sketched designs, both user and administrator roles
- Make generic classes as templates for future items to be added
- Provision space for database, test connectivity between programming language chosen and database
- Write member functions for template classes (add, remove, etc.)
- Link GUI elements to generic class member functions to test functionality
- Research types of items that warehouses/libraries would benefit from keeping track of
- Research libraries/methods for interpreting data from various scanners (barcode, NFC, RFID)
- Implement methods to handle data from multiple scanning interfaces
- Design classes that inherit the generic template class, incorporating scan data functions
- Refine GUI to reflect new functionality as well as refine visually
- Test program functionality (incl. scanning) in a mock real-world inventory scenario from the perspective of a database administrator
- Test program functionality (incl. scanning) in a mock real-world inventory scenario from the perspective of an end user

### Timeline

This timeline has been created under the assumption that the final date for senior design project submissions is 05/01/2023. The time to complete milestones may scale up or down depending on the validity of this estimated end date.

![Timeline Gantt chart](project_planning/project_gantt.png)
![Timeline Gantt chart dates](project_planning/project_gantt_dates.png)

## ABET Concerns

A summarized version of the ABET Concerns essay for this project is listed below. For more in-depth analysis, please view the [full essay](project_planning/assignment07_project_constraints_margesji.pdf).

### Economic Constraints

Implementing tagging for the inventory system may require physical hardware, like NFC tags and scanners, which could be expensive. To mitigate this, I’ve proposed an alternative, cost-free tagging system where administrators can use unique serial codes and manual keyboard entry instead of specialized hardware.

### Legal Constraints

Displaying item images, such as book covers or tools, in the database poses potential image licensing issues. To address this, I plan to allow administrators to upload their own images. This approach ensures that the images used in the system comply with copyright laws, as the administrators would own the rights to the photos.

### Security Constraints

Managing a local database without proper access controls could create significant security risks. To prevent this, I’m designing a user identification system with defined roles. Administrators will have full access, while regular users will have restricted access, ensuring data integrity and security.

## PPT Slideshow

### Presentation

A presentation overview of the project is available in PowerPoint form [here](project_planning/assignment08_slideshow_margesji.pptx).

### Video

A narrated version of the project overview is available for download [here](project_planning/assignment08_presentation_margesji.mkv), or for viewing on my YouTube channel here: https://youtu.be/K8hqDVZwBLc

## Self-assessment Essay

A self assessment essay by each team member is listed below. This essay includes design choices and rationale for the project as a whole, as well as background information regarding skills utilized in the STIMS project.

Jack Margeson - [Self-assessment Essay](project_planning/assignment03_senior_design_margesji.pdf)

## Professional Biography

The professional biography of each team member is listed below.

Jack Margeson - [Professional Biography](<Jack Margeson - Professional Biography.md>)

## Budget

To date (12/01/2024), no costs have been incurred by the STIMS project. No current expenses are planned.

## Appendix

Main repository (you are here): https://github.com/jack-margeson/stims

Built with [Bun](https://bun.sh/), a modern TypeScript development toolkit.

Gantt charts created with [onlinegantt.com](https://www.onlinegantt.com/).

Please note that no meeting notes are available, as STIMS is being developed solo.

I, Jack Margeson, affirm that as of December 1, 2024, I have dedicated a minimum of 45 hours to project planning and prototyping efforts.

### Further Reading

- [Docker documentation](https://docs.docker.com/)
- [Angular documentation](https://v17.angular.io/docs)
- [PostgresSQL documentation](https://www.postgresql.org/docs/)
- [Node.js documentation](https://nodejs.org/docs/latest/api/)
