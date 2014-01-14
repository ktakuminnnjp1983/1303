#include <stdio.h>
#include <sys/types.h>
#include <corba/CORBA.h>

int main()
{
    printf("\n");
    printf("###### C++ types ######\n");
    printf("%-15s size[%d]\n", "char", sizeof(char));
    printf("%-15s size[%d]\n", "bool", sizeof(bool));
    printf("%-15s size[%d]\n", "short", sizeof(short));
    printf("%-15s size[%d]\n", "int", sizeof(int));
    printf("%-15s size[%d]\n", "long", sizeof(long));
    printf("%-15s size[%d]\n", "long int", sizeof(long int));
    printf("%-15s size[%d]\n", "float", sizeof(float));
    printf("%-15s size[%d]\n", "long long", sizeof(long long));
    printf("%-15s size[%d]\n", "long long int", sizeof(long long int));
    printf("%-15s size[%d]\n", "long dobule", sizeof(long double));
    printf("%-15s size[%d]\n", "int16_t", sizeof(int16_t));
    printf("%-15s size[%d]\n", "int32_t", sizeof(int32_t));
    printf("%-15s size[%d]\n", "int64_t", sizeof(int64_t));
    printf("%-15s size[%d]\n", "intptr_t", sizeof(intptr_t));
    printf("%-15s size[%d]\n", "off_t", sizeof(off_t));
    printf("%-15s size[%d]\n", "size_t", sizeof(size_t));
    printf("%-15s size[%d]\n", "time_t", sizeof(time_t));
    printf("###### CORBA types ######\n");
    // see include/infra/msgorb/ICommonTypeDef.h
    printf("%-15s size[%d]\n", "CORBA::Boolean", sizeof(CORBA::Boolean));
    printf("%-15s size[%d]\n", "CORBA::Octet", sizeof(CORBA::Octet));
    printf("%-15s size[%d]\n", "CORBA::Char", sizeof(CORBA::Char));
    printf("%-15s size[%d]\n", "CORBA::Short", sizeof(CORBA::Short));
    printf("%-15s size[%d]\n", "CORBA::Long", sizeof(CORBA::Long));
    printf("%-15s size[%d]\n", "CORBA::LongLong", sizeof(CORBA::LongLong));
    printf("\n");

    return 0;
}
