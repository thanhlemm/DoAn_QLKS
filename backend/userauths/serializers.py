from rest_framework import serializers
from .models import User, Role
from django.contrib.auth.models import AnonymousUser


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=True)

    class Meta:
        model = User
        fields = (
            'username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role', 'DOB', 'address', 'phone',
            'sex')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            role=validated_data['role'],
            avatar=validated_data.get('avatar'),
            DOB=validated_data.get('DOB'),
            address=validated_data.get('address'),
            phone=validated_data.get('phone'),
            sex=validated_data.get('sex')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar', 'DOB', 'address', 'phone', 'email', 'sex',
                  'role']
        extra_kwargs = {'password': {'write_only': True}}

    def get_avatar(self, obj):
        if isinstance(obj, AnonymousUser):
            return None
        return obj.avatar.url if obj.avatar else None

    def to_representation(self, instance):
        if isinstance(instance, AnonymousUser):
            return {}
        return super().to_representation(instance)

    # def create(self, validated_data):
    #     role_data = validated_data.pop('role')
    #     account = User.objects.create(**validated_data)
    #     account.set_password(validated_data['password'])
    #     account.save()
    #     return account
    #
    # def update(self, instance, validated_data):
    #     role_data = validated_data.pop('role')
    #     instance.username = validated_data.get('username', instance.username)
    #     instance.name = validated_data.get('name', instance.name)
    #     instance.DOB = validated_data.get('DOB', instance.DOB)
    #     instance.Address = validated_data.get('Address', instance.Address)
    #     instance.phone = validated_data.get('phone', instance.phone)
    #     instance.email = validated_data.get('email', instance.email)
    #     instance.sex = validated_data.get('sex', instance.sex)
    #     instance.role = Role.objects.get(id=role_data['id'])
    #     if 'password' in validated_data:
    #         instance.set_password(validated_data['password'])
    #     instance.save()
    #     return instance
