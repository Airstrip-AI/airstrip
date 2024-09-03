<p align="center">
<img src="https://github.com/user-attachments/assets/a17ffb83-2acb-4531-bb1c-6d297e35d097" width="150" height="150" style="margin-left: auto; margin-right: auto;" />
</p>

# Airstrip: Open-source enterprise generative AI platform

Airstrip is an open-source enterprise generative AI platform. Airstrip combines the best-in-class open-source tools to provide a complete and secure platform that allows you to build generative AI apps easily.

- [x] Teams and RBAC.
- [x] LLM Integrations.
  - [x] Vault storage for API keys.
- [] ( :construction: ) RAG and Chunking.
- [] ( :construction: ) Memory layer for enhanced context.
- [] ( :bulb: ) LLM usage analytics.
- [] ( :bulb: ) Rate-limits
- [] ( :bulb: ) REST APIs.

| **Legend**     |         |
| -------------- | ------- |
| :bulb:         | Planned |
| :construction: | WIP     |

<!-- TODO: add list of open-source tools used -->

## Getting started

The fastest way to try Airstrip is signing up for free at [Airstrip Cloud](https://airstrip.pro/).

### Run Airstrip locally

To set up and run Airstrip locally, follow the instructions for [self-hosting](./README-self-host.md).

## Features

|                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <h3>Manage AI integrations</h3> Bring your own API keys and connect to different LLM providers. We currently support **OpenAI**, **Mistral**, **Google**, **Cohere**, **Anthropic**, and **self-hosted LLMs** with an OpenAI-compatible interface. |                                                       <img width="1512" alt="ai-integrations" src="https://github.com/user-attachments/assets/ee742fc0-0790-44ff-a2ae-55d47ecd5493">                                                        |
| <h3>Teams and role-based access control</h3> Manage teams and control access to different AI integrations.                                                                                                                                         |                                                            <img width="1512" alt="teams" src="https://github.com/user-attachments/assets/c3623b8e-a7c2-4af4-92dd-d06c21b47056">                                                             |
| <h3>Build and use internal AI apps</h3> Build internal AI apps by adding prompts and specifying which LLM provider to connect to.                                                                                                                  | <img width="1512" alt="edit-app" src="https://github.com/user-attachments/assets/9511ee23-e42e-4d63-8dad-9f2762ca0af8"> <img width="1512" alt="chat" src="https://github.com/user-attachments/assets/891079db-5c8d-47f4-8c84-18a5fcc38b38"> |
| <h3>Usage analytics</h3> View usages across all apps and AI integrations in one place. (To be honest, it's quite basic for now. Still working on this.)                                                                                            |                                                          <img width="1511" alt="analytics" src="https://github.com/user-attachments/assets/167d7e9b-caf3-4b42-b3c1-098357610ed8">                                                           |

## How to use

#### Roles

- Upon creating an account, you will be assigned an organization which you are an owner of. You can invite people to your organization.
- There are 3 types of roles: **Owner**, **Admin**, and **Member**.
- There is no difference between Owner and Admin at the moment other than Admin is unable to change an Owner's role.
- Whatever an Admin can do, an Owner can do too. When you see the term "admin", it means "Admins and Owners" unless otherwise specified.
- The 3 roles also apply to team members.

#### Teams

- Each organization can have many teams. Only org admins can create teams.
- Org admins and team admins can invite members to the team.

#### AI (LLM) integrations

- AI integrations can only be created by org admins and are created at the org level.
- AI integrations can be restricted to a team, i.e. only apps created in the team can use the AI integration.
- Org-wide AI integrations can be used by any team.

#### Apps

- Only org/team admins can create apps in the org/team respectively.
- Org-wide apps can be used by any org member.
- Team apps can only be used by the team's members or org admins.

## Feature requests/Bug reports

Please submit any feature requests or issues in Github issues.
