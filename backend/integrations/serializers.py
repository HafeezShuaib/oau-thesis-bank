from rest_framework import serializers


class ProviderStatusSerializer(serializers.Serializer):
    provider = serializers.CharField()
    configured = serializers.BooleanField(required=False)
    authorization_url = serializers.URLField(required=False, allow_null=True)
    detail = serializers.CharField(required=False, allow_null=True)
    linked = serializers.CharField(required=False, allow_null=True)