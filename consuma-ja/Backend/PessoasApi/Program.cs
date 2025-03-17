using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])
            )
        };
    });

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("http://localhost:8081") // Adiciona a origem do frontend
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Se você precisar de cookies ou autenticação
        });
});

builder.Services.AddAuthorization();


var app = builder.Build();

app.UseCors(MyAllowSpecificOrigins); // Habilita o CORS aqui!

// Configuração do ambiente de desenvolvimento (Swagger)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Configuração de middlewares
app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication(); // Antes de UseAuthorization!
app.UseAuthorization();

app.UseAuthorization();

// Roteamento de Controllers para API
app.MapControllers();

app.Run();
