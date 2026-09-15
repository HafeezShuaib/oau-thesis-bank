import time

from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError


class Command(BaseCommand):
    help = "Wait for the database to be reachable (used by Docker entrypoint)."

    def add_arguments(self, parser):
        parser.add_argument("--timeout", type=int, default=60)

    def handle(self, *args, **options):
        timeout = options["timeout"]
        start = time.monotonic()
        while time.monotonic() - start < timeout:
            try:
                connections["default"].cursor()
                self.stdout.write(self.style.SUCCESS("Database is ready."))
                return
            except OperationalError:
                time.sleep(1)
        raise OperationalError("Database did not become ready in time.")