---
title: "L’IA décide-t-elle seule d’un patient ? Article 22 du RGPD"
description: "Un logiciel peut-il trancher seul sur un patient ? Ce que dit l’article 22 du RGPD sur la décision automatisée, et les questions à poser au DPO."
pubDate: 2026-11-16
category: "Chronique"
draft: false
series: "donnees-dispositifs-incidents"
---

Un fournisseur propose un module qui « classe automatiquement » les demandes de rendez-vous ou les dossiers selon leur priorité. Une cadre de santé demande : « Et si le logiciel se trompe, qui répond au patient ? » Le RGPD a un article pour cette situation : l’article 22, consacré à la décision individuelle automatisée. Nous avons lu le texte officiel en français du règlement (UE) 2016/679, tel que publié au Journal officiel de l’Union européenne. Nous n’avons pas lu la loi « Informatique et libertés » ni de guide de la CNIL sur ce point : pour l’application en France, interrogez votre délégué à la protection des données (DPD ou DPO). Information générale, pas un avis juridique.

## Ce que pose l’article 22

Le paragraphe 1 donne à la personne concernée le droit de ne pas faire l’objet d’une décision fondée exclusivement sur un traitement automatisé, y compris le profilage, produisant des effets juridiques la concernant ou l’affectant de manière significative de façon similaire.

Deux mots comptent : « exclusivement » et « effets ». Un outil qui prépare une proposition qu’un soignant examine puis décide est, a priori, d’une autre nature qu’un outil dont la sortie s’applique sans personne. Mais la frontière dépend du fonctionnement réel : si le professionnel valide sans pouvoir ni temps d’examiner, la décision peut être, en pratique, automatique. Cette appréciation se fait cas par cas, avec votre DPO.

## Les exceptions et les garanties

Le paragraphe 2 prévoit que cette règle ne s’applique pas lorsque la décision est nécessaire à la conclusion ou à l’exécution d’un contrat, autorisée par le droit de l’Union ou de l’État membre avec des mesures appropriées, ou fondée sur le consentement explicite de la personne.

Le paragraphe 3 ajoute que, dans les cas du contrat et du consentement explicite, le responsable de traitement met en œuvre des mesures appropriées pour sauvegarder les droits et les intérêts légitimes de la personne, « au moins » le droit d’obtenir une intervention humaine, d’exprimer son point de vue et de contester la décision.

## Les données de santé

Le paragraphe 4 vise les catégories particulières de données de l’article 9, dont les données de santé. Les décisions des exceptions du paragraphe 2 ne peuvent être fondées sur ces données, à moins que l’article 9, paragraphe 2, point a) (consentement explicite) ou point g) (motifs d’intérêt public important) ne s’applique et que des mesures appropriées de sauvegarde soient en place. Pour un hôpital, c’est un point à examiner de près avant de laisser un outil trancher sur la base de données de patients.

## Ce que le projet de guide HAS–CNIL ajoute

Le projet de guide HAS–CNIL (document de travail du 16 février 2026) insiste sur le contrôle humain : les personnes chargées de ce contrôle doivent disposer des compétences, de la formation, de l’autorité et du soutien nécessaires. C’est une mise en garde pratique en rapport avec l’article 22, même si le document n’est qu’un projet.

## Cinq questions à poser avant le déploiement

Ces questions sont des suggestions de l’auteur, pas des exigences de l’article.

1. Qui, concrètement, valide la sortie de l’outil, et a-t-il le temps et l’autorité de la contester ?
2. L’outil produit-il une décision qui touche le patient de façon significative (accès aux soins, priorité, facturation) ?
3. Le patient peut-il demander une intervention humaine, et le sait-il ?
4. Quelle est la base juridique retenue, et le DPO l’a-t-il examinée ?
5. Comment le fournisseur décrit-il, par écrit, la part d’automatisation ?

## À retenir

- L’article 22 du RGPD donne le droit de ne pas faire l’objet d’une décision fondée exclusivement sur un traitement automatisé, produisant des effets juridiques ou affectant la personne de manière significative.
- Les exceptions s’accompagnent d’au moins une intervention humaine, d’un droit d’exprimer son point de vue et de contester ; les données de santé ajoutent des conditions (article 22, paragraphe 4).
- Faites examiner chaque outil de tri ou de priorisation par votre DPO. Information générale, pas un avis juridique.

*Sources : [RGPD, texte officiel en français](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) (article 22, avec l’article 9, paragraphe 2 mentionné par son paragraphe 4) ; [projet de guide HAS-CNIL (document de travail, 16 février 2026)](https://cnil.fr/sites/default/files/2026-03/guide_has_cnil_recommandations_ia.pdf). Lu le 16 novembre 2026.*
