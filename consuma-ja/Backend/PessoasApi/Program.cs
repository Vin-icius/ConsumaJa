using Microsoft.EntityFrameworkCore;
using PessoasApi.Context;
using PessoasApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurações do Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração da conexão com o MySQL
var mySqlConnection = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<PessoasContext>(options =>
    options.UseMySql(mySqlConnection, ServerVersion.AutoDetect(mySqlConnection)));

// Injeção de dependência para o serviço
builder.Services.AddScoped<PessoaService>();

// Configuração de Controllers para API (sem suporte para Views)
builder.Services.AddControllers();

var app = builder.Build();

// Configuração do ambiente de desenvolvimento (Swagger)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configuração de middlewares
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();

// Roteamento de Controllers para API
app.MapControllers();

app.Run();
