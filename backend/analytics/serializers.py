from rest_framework import serializers


class OverviewSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_theses = serializers.IntegerField()
    published_theses = serializers.IntegerField()
    draft_theses = serializers.IntegerField()
    restricted_theses = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_saves = serializers.IntegerField()
    active_users = serializers.IntegerField()


class TopThesisSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    author = serializers.CharField()
    department = serializers.CharField()
    faculty = serializers.CharField()
    views = serializers.IntegerField()
    save_count = serializers.IntegerField()


class BreakdownRowSerializer(serializers.Serializer):
    department = serializers.CharField(required=False)
    faculty = serializers.CharField(required=False)
    year = serializers.IntegerField(required=False)
    count = serializers.IntegerField()
    views = serializers.IntegerField()
    saves = serializers.IntegerField()


class TrendRowSerializer(serializers.Serializer):
    month = serializers.DateField(required=False, allow_null=True)
    theses = serializers.IntegerField()
    views = serializers.IntegerField()
    saves = serializers.IntegerField()