// src/config/multer.config.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { AppError } from '../common/errors/app-error'; // Ajuste o caminho se necessário

// Define o diretório de destino (fora da pasta 'src' e 'dist')
// Ajuste '../../../fotosUsuarios' se a estrutura for diferente
// '__dirname' aponta para dist/config, então ../../../ sobe para a raiz do projeto
const UPLOAD_DIRECTORY = path.resolve(__dirname, '../../../../fotosUsuarios');

// Garante que o diretório de upload exista
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
    console.log(`[Multer] Criando diretório de uploads: ${UPLOAD_DIRECTORY}`);
    fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
} else {
    console.log(`[Multer] Usando diretório de uploads existente: ${UPLOAD_DIRECTORY}`);
}

// Configuração de armazenamento do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIRECTORY); // Salva na pasta definida
    },
    filename: (req: Request, file, cb) => {
        // Extrai ID e tipo da foto dos parâmetros da ROTA
        const userId = req.params.id;
        const tipoFotoParam = req.params.tipoFoto?.toLowerCase();
        // Garante que tipoFoto seja apenas 'selfie' ou 'documento'
        const tipoFoto = (tipoFotoParam === 'selfie' || tipoFotoParam === 'documento') ? tipoFotoParam : 'desconhecido';

        // Validação essencial antes de criar o nome do arquivo
        if (!userId) {
             console.error("[Multer Filename] Erro: ID do usuário não encontrado nos parâmetros da rota (req.params.id). Rota:", req.originalUrl);
             return cb(new Error('ID do usuário não encontrado na rota para upload.'), '');
        }
        if (tipoFoto === 'desconhecido') {
             console.error("[Multer Filename] Erro: Tipo de foto inválido nos parâmetros da rota (req.params.tipoFoto). Rota:", req.originalUrl);
              return cb(new Error('Tipo de foto inválido na rota (deve ser selfie ou documento).'), '');
        }


        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname).toLowerCase() || '.jpg'; // Usa extensão original ou .jpg

        // <<< CORREÇÃO: Usar Template Literal (crases) e ${variavel} >>>
        const newFilename = `${userId}-${tipoFoto}-${timestamp}${fileExtension}`;
        // -------------------------------------------------------------

        console.log(`[Multer Filename] Salvando arquivo como: ${newFilename}`);
        cb(null, newFilename);
    }
});

// Filtro de arquivo (mantido)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']; // Ajuste os tipos se necessário
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.warn(`[Multer FileFilter] Tipo de arquivo rejeitado: ${file.mimetype}`);
        cb(new AppError('Apenas arquivos de imagem (JPEG, PNG, WEBP) são permitidos.', 400));
    }
};

// Configuração final do Multer (exportada como default)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limite de 5MB
    }
});

export default upload;