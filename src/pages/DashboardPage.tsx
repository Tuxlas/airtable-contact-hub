
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-airtable-queries";
import { User, Building, MapPin, Grid2X2, ChevronRight, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const DashboardPage = () => {
  const { data, isLoading, isError } = useDashboardData();

  const COLORS = ['#BE1E2D', '#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout title="Dashboard">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">
            Error al cargar los datos del dashboard
          </p>
          <p>
            Por favor, intenta recargar la página o verifica la conexión con
            Airtable.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="grid grid-cols-4 gap-2 mb-8">
        <Card className="p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <User className="text-primary" size={20} />
          </div>
          <p className="text-xl font-bold text-text-title">{data.totalContacts}</p>
          <p className="text-xs text-text-body">Contactos</p>
        </Card>

        <Card className="p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <Building className="text-primary" size={20} />
          </div>
          <p className="text-xl font-bold text-text-title">{data.totalCompanies}</p>
          <p className="text-xs text-text-body">Empresas</p>
        </Card>

        <Card className="p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <MapPin className="text-primary" size={20} />
          </div>
          <p className="text-xl font-bold text-text-title">{data.totalLocations}</p>
          <p className="text-xs text-text-body">Sedes</p>
        </Card>

        <Card className="p-3 flex flex-col items-center justify-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
            <Grid2X2 className="text-primary" size={20} />
          </div>
          <p className="text-xl font-bold text-text-title">{data.totalSectors}</p>
          <p className="text-xs text-text-body">Sectores</p>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-text-title">Recent Contacts</h2>
          <Card className="shadow-sm overflow-hidden">
            {data.recentContacts && data.recentContacts.length > 0 ? (
              <div>
                {data.recentContacts.map((contact, index) => (
                  <Link
                    key={contact.id}
                    to={`/contacts/${contact.id}`}
                    className="flex items-center p-4 hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 mr-4">
                      <Avatar className="h-12 w-12">
                        {contact.fields["Tarjeta Escaneada"] && contact.fields["Tarjeta Escaneada"].length > 0 ? (
                          <AvatarImage 
                            src={contact.fields["Tarjeta Escaneada"][0]} 
                            alt={contact.fields.Nombre || "Contacto"} 
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10">
                            <UserRound className="h-6 w-6 text-primary" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-text-title truncate">
                        {contact.fields.Nombre || "Sin nombre"}
                      </h3>
                      <p className="text-sm text-text-body truncate">
                        {contact.fields.Empresa && contact.fields.Empresa.length > 0 
                          ? contact.fields.Empresa[0] 
                          : contact.fields.Cargo || ""}
                      </p>
                      <p className="text-sm text-text-body truncate">
                        {contact.fields.Email}
                      </p>
                      <p className="text-sm text-text-body truncate">
                        {contact.fields.Telefono}
                      </p>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                    {index !== data.recentContacts.length - 1 && (
                      <div className="absolute left-16 right-4 bottom-0 h-px bg-gray-100"></div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay contactos registrados
              </p>
            )}
          </Card>
        </div>

        {data.companiesBySector && data.companiesBySector.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-text-title">Distribución de empresas por sector</h2>
            <Card className="p-4 shadow-sm">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={data.companiesBySector}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => entry.name}
                    >
                      {data.companiesBySector.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
