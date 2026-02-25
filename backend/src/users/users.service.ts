import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole, CompanyStatus, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(data: any) {
    const { 
      role, 
      firstName, lastName, email, password, phone, 
      companyName, companyTaxId, companyAddress, companyPhone, companyEmail,
      companyId, 
      areaId,
      experienceLevel
    } = data;

    const hashedPassword = password; 

    if (role === UserRole.COMPANY_ADMIN) {
      return this.prisma.$transaction(async (tx) => {
        // Generamos un código único tipo Classroom (Ej: FS-XJ23)
        const inviteCode = 'FS-' + Math.random().toString(36).substring(2, 8).toUpperCase();

        // 1. Creamos la organización con su código de invitación
        const newCompany = await tx.company.create({
          data: {
            legalName: companyName,
            taxId: companyTaxId,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            inviteCode: inviteCode, // GUARDAMOS EL CÓDIGO
            status: CompanyStatus.ACTIVE
          }
        });

        // 2. Creamos al usuario administrador y lo vinculamos a la empresa recién creada
        const newUser = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: UserRole.COMPANY_ADMIN,
            phone,
            accountStatus: UserStatus.ACTIVE,
            id_company_fk: newCompany.id_company,
          }
        });

        // 3. Cerramos el círculo: La empresa ahora sabe quién es su administrador principal
        await tx.company.update({
          where: { id_company: newCompany.id_company },
          data: { mainAdminId_fk: newUser.id_user }
        });

        return { user: newUser, company: newCompany };
      });
    }

    // Lógica para empleados y técnicos (registro independiente)
    if (role === UserRole.EMPLOYEE || role === UserRole.SUPPORT_TECH) {
        const userData: any = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role,
            phone,
            accountStatus: UserStatus.ACTIVE,
            // id_company_fk queda como nulo inicialmente
        };

        if (role === UserRole.SUPPORT_TECH) {
            userData.experienceLevel = experienceLevel;
        }

        return this.prisma.user.create({
            data: userData
        });
    }
  }

  // Método para vincular un empleado a una empresa usando el código secreto
  async linkCompany(id_user: number, inviteCode: string) {
    // 1. Buscamos la empresa que tenga ese código
    const company = await this.prisma.company.findUnique({
      where: { inviteCode }
    });

    if (!company) {
      throw new Error('Código de invitación inválido');
    }

    // 2. Actualizamos al usuario con el ID de la empresa encontrada
    return this.prisma.user.update({
      where: { id_user },
      data: { id_company_fk: company.id_company },
      include: { company: true } // Devolvemos el usuario con los datos de la empresa
    });
  }

  async getCompanies() {
      return this.prisma.company.findMany({
          select: { id_company: true, legalName: true } // USANDO NUEVO NOMBRE
      });
  }
  
  async getAreas(id_company_fk: number) {
      return this.prisma.area.findMany({
          where: { id_company_fk } // USANDO NUEVO NOMBRE
      });
  }
}
