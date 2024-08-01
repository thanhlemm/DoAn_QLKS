from rest_framework import serializers
from ..models import Account, Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'


class AccountSerializer(serializers.ModelSerializer):
    role = RoleSerializer()

    class Meta:
        model = Account
        fields = ['id', 'username', 'name', 'avatar', 'DOB', 'Address', 'phone', 'email', 'sex', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role_data = validated_data.pop('role')
        account = Account.objects.create(**validated_data)
        account.set_password(validated_data['password'])
        account.save()
        return account

    def update(self, instance, validated_data):
        role_data = validated_data.pop('role')
        instance.username = validated_data.get('username', instance.username)
        instance.name = validated_data.get('name', instance.name)
        instance.DOB = validated_data.get('DOB', instance.DOB)
        instance.Address = validated_data.get('Address', instance.Address)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.email = validated_data.get('email', instance.email)
        instance.sex = validated_data.get('sex', instance.sex)
        instance.role = Role.objects.get(id=role_data['id'])
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        return instance


