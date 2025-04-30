
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-airtable-queries";
import { User, Building, MapPin, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const DashboardPage = () => {
  const { data, isLoading, isError } = useDashboardData();

  const COLORS = ['#BE1E2D', '#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User size={14} className="mr-2" />
              Contactos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-semibold">{data.totalContacts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Building size={14} className="mr-2" />
              Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-semibold">{data.totalCompanies}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin size={14} className="mr-2" />
              Sedes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-semibold">{data.totalLocations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <PieChart size={14} className="mr-2" />
              Sectores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-semibold">{data.totalSectors}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">
              Últimos contactos añadidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {data.recentContacts && data.recentContacts.length > 0 ? (
              <ul className="space-y-2">
                {data.recentContacts.map((contact) => (
                  <li key={contact.id}>
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="flex justify-between hover:bg-gray-50 p-2 rounded"
                    >
                      <span className="font-medium">
                        {contact.fields.Nombre || "Sin nombre"}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(contact.createdTime).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay contactos registrados
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg">
              Distribución de empresas por sector
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {data.companiesBySector && data.companiesBySector.length > 0 ? (
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
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay datos de sectores disponibles
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
