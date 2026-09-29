from django.core.management.base import BaseCommand

from accounts.models import User
from collaboration.models import CollaborationOpportunity
from researchers.models import ResearcherProfile
from theses.models import Tag, Thesis


# Mirrors frontend/src/components/shared.tsx MOCK_USERS / MOCK_THESES.
SEED_USERS = [
    {"id": "u1", "name": "Adekunle Ojo", "role": "researcher", "dept": "Agricultural Engineering"},
    {"id": "u2", "name": "Dr. O. A. Fajemisin", "role": "faculty", "dept": "Agricultural Engineering"},
    {"id": "u3", "name": "Prof. E. R. Adagunodo", "role": "faculty", "dept": "Computer Science"},
]

SEED_THESES = [
    {
        "title": "Machine Learning for Crop Yield Prediction in Nigeria",
        "author": "Adekunle Ojo",
        "dept": "Agricultural Engineering",
        "faculty": "Technology",
        "year": 2023,
        "abstract": "This study applies random forest regressors to predict crop yields based on climate and soil data from Osun State.",
        "area": "AI in Agriculture",
        "supervisor": "Dr. O. A. Fajemisin",
        "tags": ["Machine Learning", "Agriculture", "Predictive Modeling"],
        "status": "Published",
        "owner_email": "adek@oauife.edu.ng",
    },
    {
        "title": "Natural Language Processing for Yoruba Text Classification",
        "author": "Oluwaseun Adetunji",
        "dept": "Computer Science",
        "faculty": "Science",
        "year": 2024,
        "abstract": "A novel approach to sentiment analysis for the Yoruba language using fine-tuned transformer models.",
        "area": "Natural Language Processing",
        "supervisor": "Prof. E. R. Adagunodo",
        "tags": ["NLP", "Yoruba", "Transformers"],
        "status": "Published",
        "owner_email": "adetunji@oauife.edu.ng",
    },
    {
        "title": "Predictive Modelling of Student Academic Performance",
        "author": "Fatima Ibrahim",
        "dept": "Education",
        "faculty": "Education",
        "year": 2022,
        "abstract": "Using historical student data to identify at-risk students early in their academic journey.",
        "area": "Educational Data Mining",
        "supervisor": "Dr. T. O. Awotunde",
        "tags": ["Data Mining", "Education"],
        "status": "Published",
        "owner_email": "fatima@oauife.edu.ng",
    },
    {
        "title": "Deep Learning Approaches for Early Plant Disease Detection",
        "author": "Chukwudi Eze",
        "dept": "Computer Science",
        "faculty": "Science",
        "year": 2024,
        "abstract": "An evaluation of CNN architectures for detecting cassava mosaic disease from mobile phone imagery.",
        "area": "Computer Vision",
        "supervisor": "Dr. A. O. Ojo",
        "tags": ["Computer Vision", "Agriculture", "Deep Learning"],
        "status": "Draft",
        "owner_email": "chukwudi@oauife.edu.ng",
    },
    {
        "title": "Economic Impact of Fintech Adoption in Rural Markets",
        "author": "Ngozi Okoro",
        "dept": "Economics",
        "faculty": "Social Sciences",
        "year": 2023,
        "abstract": "An empirical analysis of mobile money penetration and its effect on small business growth in southwestern Nigeria.",
        "area": "Development Economics",
        "supervisor": "Prof. M. A. Adebayo",
        "tags": ["Fintech", "Economics", "Rural Development"],
        "status": "Processing",
        "owner_email": "ngozi@oauife.edu.ng",
    },
]

ROLE_MAP = {
    "Alumni": "researcher",
    "Supervisor": "faculty",
    "Faculty": "faculty",
    "student": "student",
    "researcher": "researcher",
    "faculty": "faculty",
    "admin": "admin",
}

STATUS_MAP = {
    "Published": Thesis.Status.PUBLISHED,
    "Draft": Thesis.Status.DRAFT,
    "Processing": Thesis.Status.PROCESSING,
}

PASSWORD = "oau-thesis-demo-password"

SEED_RESEARCHERS = {
    "u1": {
        "bio": "Researcher in agricultural technology and machine learning applications.",
        "github": "adekunle",
        "research_interests": "AI in Agriculture; Predictive Modeling",
        "is_available_for_mentoring": False,
    },
    "u2": {
        "bio": "Faculty advisor in Agricultural Engineering.",
        "orcid": "https://orcid.org/0000-0002-0000-0001",
        "github": "fajemisin",
        "research_interests": "Soil Science; Irrigation Systems",
        "is_available_for_mentoring": True,
    },
    "u3": {
        "bio": "Professor of Computer Science.",
        "orcid": "https://orcid.org/0000-0002-0000-0002",
        "github": "adagunodo",
        "research_interests": "Natural Language Processing; Software Engineering",
        "is_available_for_mentoring": True,
    },
}

SEED_OPPORTUNITIES = [
    {
        "title": "Looking for collaborators on crop yield prediction models",
        "description": "Join an ongoing project applying machine learning to climate and soil data to forecast crop yields in Osun State.",
        "owner_email": "u1@demo.local",
        "tags": ["Machine Learning", "Agriculture", "Predictive Modeling"],
    },
]


class Command(BaseCommand):
    help = "Seed demo users and theses mirroring the frontend mock data."

    def handle(self, *args, **options):
        counts = {"users": 0, "theses": 0, "tags": 0, "profiles": 0, "opportunities": 0}

        for item in SEED_USERS:
            email = f"{item['id']}@demo.local"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "role": ROLE_MAP.get(item["role"], "researcher"),
                    "department": item["dept"],
                    "faculty": "Faculty of Technology",
                    "avatar": item["name"][:2].upper(),
                    "status": "active",
                },
            )
            if created:
                user.set_password(PASSWORD)
                first, sep, last = item["name"].partition(" ")
                user.first_name = first
                user.last_name = last if sep else ""
                user.save()
                counts["users"] += 1

        for item in SEED_THESES:
            owner, created = User.objects.get_or_create(
                email=item["owner_email"],
                defaults={
                    "role": "researcher",
                    "department": item["dept"],
                    "faculty": item["faculty"],
                    "avatar": item["author"][:2].upper(),
                    "status": "active",
                },
            )
            if created:
                owner.set_password(PASSWORD)
                first, sep, last = item["author"].partition(" ")
                owner.first_name = first
                owner.last_name = last if sep else ""
                owner.save()

            thesis, created = Thesis.objects.get_or_create(
                title=item["title"],
                defaults={
                    "owner": owner,
                    "author": item["author"],
                    "department": item["dept"],
                    "faculty": item["faculty"],
                    "year": item["year"],
                    "abstract": item["abstract"],
                    "supervisor": item["supervisor"],
                    "status": STATUS_MAP[item["status"]],
                    "access_policy": Thesis.AccessPolicy.PUBLIC,
                    "processing_status": Thesis.ProcessingStatus.NONE,
                },
            )
            if created:
                for tag_name in [item["area"]] + item["tags"]:
                    tag, _ = Tag.objects.get_or_create(name=tag_name)
                    thesis.tags.add(tag)
                    counts["tags"] += 1
                counts["theses"] += 1

        for item in SEED_RESEARCHERS:
            user = User.objects.filter(email=f"{item}@demo.local").first()
            if not user:
                continue
            defaults = dict(SEED_RESEARCHERS[item])
            profile, created = ResearcherProfile.objects.get_or_create(user=user, defaults=defaults)
            if created:
                counts["profiles"] += 1
            elif profile.bio != defaults["bio"]:
                for attr, value in defaults.items():
                    setattr(profile, attr, value)
                profile.save()

        for item in SEED_OPPORTUNITIES:
            owner = User.objects.filter(email=item["owner_email"]).first()
            if not owner:
                continue
            opportunity, created = CollaborationOpportunity.objects.get_or_create(
                title=item["title"],
                defaults={
                    "description": item["description"],
                    "owner": owner,
                    "status": CollaborationOpportunity.Status.OPEN,
                },
            )
            if created:
                for tag_name in item["tags"]:
                    tag, _ = Tag.objects.get_or_create(name=tag_name)
                    opportunity.skills.add(tag)
                counts["opportunities"] += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {counts['theses']} theses, {counts['users']} users, "
                f"{counts['tags']} tags, {counts['profiles']} researcher profiles, "
                f"{counts['opportunities']} opportunities."
            )
        )