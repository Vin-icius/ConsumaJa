using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PessoasApi.Context;
using PessoasApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;


namespace PessoasApi.Services
{
    public class PessoaService
    {
        private readonly PessoasContext _context;
        private readonly string _key;

        public PessoaService(PessoasContext context){
            _context = context;
        }

        public IList<Pessoa> ListarTodas(){
            return _context.Pessoas.AsNoTracking().ToList();
        }

        public Pessoa ObterPorId(int id){
            return _context.Pessoas.FirstOrDefault(p => p.Id == id);
        }

        public void Adicionar(Pessoa pessoa){
            _context.Pessoas.Add(pessoa);
            _context.SaveChanges();
        }

        public void Atualziar(Pessoa pessoa){
            _context.Pessoas.Update(pessoa);
            _context.SaveChanges();
        }

        public void Remover(int id){ //por enquanto exclusao física, depois alterar para lógica
            var pessoa = _context.Pessoas.Find(id);
            if (pessoa != null)
            {
                _context.Pessoas.Remove(pessoa);
                _context.SaveChanges();
            }
        }


        public bool TestarConexao()
        {
            try
            {
                _context.Database.OpenConnection(); // Força abertura da conexão
                _context.Database.CloseConnection();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro na conexão: {ex.Message}");
                return false;
            }
        }
        public Pessoa ObterPorLogin(string login)
        {
            return _context.Pessoas
                .AsNoTracking()
                .FirstOrDefault(p => p.Login == login);
        }
        public string Autenticar(LoginModel loginModel)
        {
            var pessoa = _context.Pessoas.FirstOrDefault(p => p.Login == loginModel.Login && p.Senha == loginModel.Senha);
            
            if (pessoa == null)
                return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, pessoa.Login),
                    new Claim(ClaimTypes.Role, pessoa.Tipo.ToString()) // Adicionando o papel do usuário
                }),
                Expires = DateTime.UtcNow.AddHours(2), // Token válido por 2 horas
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}