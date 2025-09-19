-- MySQL dump 10.13  Distrib 9.2.0, for macos15.2 (arm64)
--
-- Host: localhost    Database: YourPasta
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contatore`
--

DROP TABLE IF EXISTS `contatore`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contatore` (
  `nome_tabella` varchar(100) NOT NULL,
  `ultimo_id` bigint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`nome_tabella`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contatore`
--

LOCK TABLES `contatore` WRITE;
/*!40000 ALTER TABLE `contatore` DISABLE KEYS */;
INSERT INTO `contatore` VALUES ('inventario',48),('ordine',112),('ordine_item',316),('piatto',1033),('piatto_item',121),('tavolo',10),('utente',15);
/*!40000 ALTER TABLE `contatore` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `categoria` varchar(30) NOT NULL,
  `quantita` int NOT NULL,
  `prezzo_unitario` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
INSERT INTO `inventario` VALUES (1,'Spaghetti','pasta',30,5),(2,'Penne','pasta',26,5),(3,'Fusilli','pasta',29,5),(4,'Linguine','pasta',24,5),(5,'Rigatoni','pasta',25,5),(6,'Tagliatelle','pasta',27,5),(7,'Farfalle','pasta',29,5),(8,'Tortellini','pasta',30,5),(9,'Ragu Bolognese','condimento_pronto',7,2),(10,'Carbonara','condimento_pronto',6,2),(11,'Pesto alla Genovese','condimento_pronto',10,2),(12,'Cacio e Pepe','condimento_pronto',8,2),(13,'Amatriciana','condimento_pronto',9,2),(14,'Frutti di Mare','condimento_pronto',9,2),(15,'Vongole','condimento_pronto',8,2),(16,'Pomodoro','condimento_base',7,1.5),(17,'Panna','condimento_base',3,1.5),(18,'Aglio Olio e Peperoncino','condimento_base',10,1),(19,'Burro e Salvia','condimento_base',10,1),(20,'Salmone','proteine',9,2),(21,'Tonno','proteine',8,2),(22,'Gamberetti','proteine',5,2),(23,'Salsiccia','proteine',10,2),(24,'Speck','proteine',9,2),(25,'Prosciutto Cotto','proteine',9,2),(26,'Tofu','proteine',10,2),(27,'Cipolla','ingrediente_base',12,1),(28,'Zucchine','ingrediente_base',14,1),(29,'Funghi','ingrediente_base',20,1),(30,'Piselli','ingrediente_base',19,1),(31,'Pomodorini','ingrediente_base',19,1),(32,'Gorgonzola','ingrediente_base',20,1),(33,'Ricotta','ingrediente_base',20,1),(34,'Spinaci','ingrediente_base',20,1),(35,'Parmigiano','topping',74,1),(36,'Peperoncino','topping',46,1),(37,'Basilico','topping',50,1),(38,'Olio Oliva','topping',70,1),(39,'Acqua naturale','bevande',96,1),(40,'Acqua frizzante','bevande',97,1),(41,'Coca Cola','bevande',56,2),(42,'Coca Cola Zero','bevande',58,2),(43,'Sprite','bevande',58,2),(44,'Fanta','bevande',60,2),(45,'The Pesca','bevande',58,2),(46,'The Limone','bevande',59,2),(47,'Birra (alcolica)','bevande',47,3.5);
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordine`
--

DROP TABLE IF EXISTS `ordine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordine` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `utente_id` bigint unsigned DEFAULT NULL,
  `data_ordine` datetime DEFAULT CURRENT_TIMESTAMP,
  `prezzo_totale` double NOT NULL,
  `n_tavolo` int unsigned DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `punti` int NOT NULL DEFAULT '0',
  `status` enum('pending','preparazione','servito','chiuso','annullato') DEFAULT 'pending',
  `is_delivery` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `utente_id` (`utente_id`),
  KEY `n_tavolo` (`n_tavolo`),
  CONSTRAINT `ordine_ibfk_1` FOREIGN KEY (`utente_id`) REFERENCES `utente` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ordine_ibfk_2` FOREIGN KEY (`n_tavolo`) REFERENCES `tavolo` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordine`
--

LOCK TABLES `ordine` WRITE;
/*!40000 ALTER TABLE `ordine` DISABLE KEYS */;
INSERT INTO `ordine` VALUES (99,2,'2025-09-17 10:05:30',9,1,'Tanto pepe per favore',9,'chiuso',_binary '\0'),(100,2,'2025-09-17 10:12:34',11,NULL,NULL,11,'chiuso',_binary '\0'),(101,7,'2025-09-17 10:18:56',8,NULL,'Consegna alle 13:00',8,'chiuso',_binary ''),(102,10,'2025-09-19 08:32:41',10,5,NULL,10,'chiuso',_binary '\0'),(103,10,'2025-09-19 09:06:04',9.2,1,'Al dente per favore',9,'chiuso',_binary '\0'),(104,11,'2025-09-19 09:32:22',31.5,1,NULL,31,'chiuso',_binary '\0'),(105,2,'2025-09-19 09:43:00',10.35,7,'Tanta cipolla',10,'chiuso',_binary '\0'),(106,2,'2025-09-19 12:36:46',10,2,NULL,10,'chiuso',_binary '\0'),(107,12,'2025-09-19 12:49:06',22.5,1,'Pasta al dente',22,'chiuso',_binary '\0'),(108,10,'2025-09-19 12:54:53',7.2,NULL,NULL,7,'servito',_binary '\0'),(109,2,'2025-09-19 12:57:22',9.45,NULL,NULL,9,'servito',_binary '\0'),(110,14,'2025-09-19 13:20:42',22.5,2,'Pasta al dente',22,'chiuso',_binary '\0'),(111,2,'2025-09-19 13:26:28',8.1,NULL,NULL,8,'pending',_binary '\0'),(112,10,'2025-09-19 13:27:29',8.8,NULL,NULL,8,'pending',_binary '');
/*!40000 ALTER TABLE `ordine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordine_item`
--

DROP TABLE IF EXISTS `ordine_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordine_item` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ordine_id` bigint unsigned NOT NULL,
  `item_id` bigint unsigned NOT NULL,
  `quantita` int unsigned NOT NULL DEFAULT '1',
  `prezzo` double NOT NULL,
  `tipo_item` enum('BEVANDA','PIATTO') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ordine_id` (`ordine_id`),
  CONSTRAINT `ordine_item_ibfk_1` FOREIGN KEY (`ordine_id`) REFERENCES `ordine` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=317 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordine_item`
--

LOCK TABLES `ordine_item` WRITE;
/*!40000 ALTER TABLE `ordine_item` DISABLE KEYS */;
INSERT INTO `ordine_item` VALUES (283,99,1019,1,8,'PIATTO'),(284,99,39,1,1,'BEVANDA'),(285,100,1020,1,9,'PIATTO'),(286,100,41,1,2,'BEVANDA'),(287,101,1021,1,8,'PIATTO'),(288,101,42,1,2,'BEVANDA'),(289,102,1022,1,11.5,'PIATTO'),(290,102,39,1,1,'BEVANDA'),(291,103,1025,1,8,'PIATTO'),(292,103,47,1,3.5,'BEVANDA'),(293,104,1022,1,11.5,'PIATTO'),(294,104,1026,1,13.5,'PIATTO'),(295,104,42,1,2,'BEVANDA'),(296,104,39,1,1,'BEVANDA'),(297,104,1027,1,7,'PIATTO'),(298,105,1028,1,9.5,'PIATTO'),(299,105,41,1,2,'BEVANDA'),(300,106,1029,1,8,'PIATTO'),(301,106,45,1,2,'BEVANDA'),(302,107,1022,1,11.5,'PIATTO'),(303,107,1030,1,11.5,'PIATTO'),(304,107,45,1,2,'BEVANDA'),(305,108,1027,1,7,'PIATTO'),(306,108,43,1,2,'BEVANDA'),(307,109,1031,1,9.5,'PIATTO'),(308,109,40,1,1,'BEVANDA'),(309,110,1022,1,11.5,'PIATTO'),(310,110,1032,1,10.5,'PIATTO'),(311,110,39,1,1,'BEVANDA'),(312,110,41,1,2,'BEVANDA'),(313,111,1033,1,8,'PIATTO'),(314,111,40,1,1,'BEVANDA'),(315,112,1020,1,9,'PIATTO'),(316,112,43,1,2,'BEVANDA');
/*!40000 ALTER TABLE `ordine_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `piatto`
--

DROP TABLE IF EXISTS `piatto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `piatto` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `prezzo` double NOT NULL,
  `utente_id` int DEFAULT NULL,
  `data_creazione` datetime(6) DEFAULT NULL,
  `descrizione` varchar(500) DEFAULT NULL,
  `is_favorito` bit(1) DEFAULT NULL,
  `numero_riordini` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1034 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `piatto`
--

LOCK TABLES `piatto` WRITE;
/*!40000 ALTER TABLE `piatto` DISABLE KEYS */;
INSERT INTO `piatto` VALUES (1019,'Cacio e Pepe',8,2,'2025-09-17 10:04:47.189788','Piatto creato con: Spaghetti, Cacio e Pepe, Olio Oliva',_binary '\0',0),(1020,'Rigatoni cipollosi',9,2,'2025-09-17 10:12:05.732216','Piatto creato con: Rigatoni, Carbonara, Cipolla',_binary '\0',0),(1021,'Linguine piccanti',8,7,'2025-09-17 10:18:19.351240','Piatto creato con: Linguine, Vongole, Peperoncino',_binary '\0',0),(1022,'Gamberetti e zucchine',11.5,10,'2025-09-19 08:32:24.372471','Piatto creato con: Linguine, Panna, Gamberetti, Zucchine, Parmigiano, Olio Oliva',_binary '\0',0),(1023,'La vegana',9,10,'2025-09-19 08:37:19.921526','Piatto creato con: Fusilli, Aglio Olio e Peperoncino, Tofu, Pomodorini',_binary '\0',0),(1024,'Farfalle pestosissime',10,10,'2025-09-19 08:58:46.492355','Piatto creato con: Farfalle, Pesto alla Genovese, Parmigiano, Basilico, Olio Oliva',_binary '\0',0),(1025,'Amatriciana extra piccante',8,10,'2025-09-19 09:04:12.446650','Piatto creato con: Rigatoni, Amatriciana, Peperoncino',_binary '\0',0),(1026,'Penne tonnate',13.5,11,'2025-09-19 09:30:27.992978','Piatto creato con: Penne, Pomodoro, Tonno, Zucchine, Pomodorini, Cipolla, Parmigiano, Olio Oliva',_binary '\0',0),(1027,'Tagliatelle al ragu',7,11,'2025-09-19 09:31:13.632897','Piatto creato con: Tagliatelle, Ragu Bolognese',_binary '\0',0),(1028,'Tonno e cipolla',9.5,2,'2025-09-19 09:42:29.548739','Piatto creato con: Penne, Pomodoro, Tonno, Cipolla',_binary '\0',0),(1029,'Linguine con vongole',8,2,'2025-09-19 12:36:14.274765','Piatto creato con: Linguine, Vongole, Olio Oliva',_binary '\0',0),(1030,'Cotto e piselli',11.5,12,'2025-09-19 12:47:53.845469','Piatto creato con: Farfalle, Panna, Prosciutto Cotto, Piselli, Parmigiano, Olio Oliva',_binary '\0',0),(1031,'Fusilli e gamberetti',9.5,2,'2025-09-19 12:57:00.829616','Piatto creato con: Fusilli, Pomodoro, Gamberetti, Peperoncino',_binary '\0',0),(1032,'Speck e zucchine',10.5,14,'2025-09-19 13:19:42.354309','Piatto creato con: Penne, Panna, Speck, Zucchine, Olio Oliva',_binary '\0',0),(1033,'Frutti di mare piccante',8,2,'2025-09-19 13:26:10.447670','Piatto creato con: Spaghetti, Frutti di Mare, Peperoncino',_binary '\0',0);
/*!40000 ALTER TABLE `piatto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `piatto_item`
--

DROP TABLE IF EXISTS `piatto_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `piatto_item` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ingrediente_id` bigint unsigned NOT NULL,
  `piatto_id` bigint unsigned NOT NULL,
  `quantita` int NOT NULL,
  `prezzo` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ingrediente_id` (`ingrediente_id`),
  KEY `piatto_id` (`piatto_id`),
  CONSTRAINT `piatto_item_ibfk_1` FOREIGN KEY (`ingrediente_id`) REFERENCES `inventario` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `piatto_item_ibfk_2` FOREIGN KEY (`piatto_id`) REFERENCES `piatto` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `piatto_item`
--

LOCK TABLES `piatto_item` WRITE;
/*!40000 ALTER TABLE `piatto_item` DISABLE KEYS */;
INSERT INTO `piatto_item` VALUES (60,1,1019,1,5),(61,12,1019,1,2),(62,38,1019,1,1),(63,5,1020,1,5),(64,10,1020,1,2),(65,27,1020,2,2),(66,4,1021,1,5),(67,15,1021,1,2),(68,36,1021,1,1),(69,4,1022,1,5),(70,17,1022,1,1.5),(71,22,1022,1,2),(72,28,1022,1,1),(73,35,1022,1,1),(74,38,1022,1,1),(75,3,1023,1,5),(76,18,1023,1,1),(77,26,1023,1,2),(78,31,1023,1,1),(79,7,1024,1,5),(80,11,1024,1,2),(81,35,1024,1,1),(82,37,1024,1,1),(83,38,1024,1,1),(84,5,1025,1,5),(85,13,1025,1,2),(86,36,1025,1,1),(87,2,1026,1,5),(88,16,1026,1,1.5),(89,21,1026,1,2),(90,28,1026,1,1),(91,31,1026,1,1),(92,27,1026,1,1),(93,35,1026,1,1),(94,38,1026,1,1),(95,6,1027,1,5),(96,9,1027,1,2),(97,2,1028,1,5),(98,16,1028,1,1.5),(99,21,1028,1,2),(100,27,1028,1,1),(101,4,1029,1,5),(102,15,1029,1,2),(103,38,1029,1,1),(104,7,1030,1,5),(105,17,1030,1,1.5),(106,25,1030,1,2),(107,30,1030,1,1),(108,35,1030,1,1),(109,38,1030,1,1),(110,3,1031,1,5),(111,16,1031,1,1.5),(112,22,1031,1,2),(113,36,1031,1,1),(114,2,1032,1,5),(115,17,1032,1,1.5),(116,24,1032,1,2),(117,28,1032,1,1),(118,38,1032,1,1),(119,1,1033,1,5),(120,14,1033,1,2),(121,36,1033,1,1);
/*!40000 ALTER TABLE `piatto_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tavolo`
--

DROP TABLE IF EXISTS `tavolo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tavolo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `disponibile` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tavolo`
--

LOCK TABLES `tavolo` WRITE;
/*!40000 ALTER TABLE `tavolo` DISABLE KEYS */;
INSERT INTO `tavolo` VALUES (1,1),(2,1),(3,0),(4,0),(5,1),(6,1),(7,1),(8,0),(9,0),(10,1);
/*!40000 ALTER TABLE `tavolo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utente`
--

DROP TABLE IF EXISTS `utente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utente` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `cognome` varchar(50) NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `data_nascita` date DEFAULT NULL,
  `ruolo` enum('cliente','studente','admin','cuoco','cameriere') NOT NULL DEFAULT 'cliente',
  `punti` int NOT NULL DEFAULT '0',
  `bloccato` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utente`
--

LOCK TABLES `utente` WRITE;
/*!40000 ALTER TABLE `utente` DISABLE KEYS */;
INSERT INTO `utente` VALUES (1,'Imane','Taoufik','imanexoxo','xoxo','imanexoxo@icloud.com','2003-02-27','admin',0,_binary '\0'),(2,'Omar','Lagrini','omardk','omardk','omar.lagrini@gmail.com','2001-02-22','cliente',32,_binary '\0'),(7,'Giorgio','Bianchini','giorgi03','giorgi03','giorgio@edu.unife.it','2003-02-06','studente',8,_binary '\0'),(8,'Marco','Gulinati','gulinello','gulinello4','guli@gmail.com','2004-01-20','cameriere',0,_binary '\0'),(9,'Tommaso','Pavani','pavone','pavone','pavard@gmail.com','2003-10-31','cuoco',0,_binary '\0'),(10,'Giada','Padovani','giadina','giadina','giada.padovani@edu.unife.it','2003-11-29','studente',19,_binary '\0'),(11,'Safa','Taoufik','safsaf','safsaf','safa27@gmail.com','2005-12-26','cliente',31,_binary '\0'),(12,'Mario','Rossi','marior','marior','mariors@gmail.com','1993-03-02','cliente',22,_binary '\0'),(13,'Rosa','Bianchi','ros','ros','rosab@gmail.com','1997-04-23','cameriere',0,_binary '\0'),(14,'Paolo','Sarpi','psarpi','psarpi','psarpi@gmail.com','1993-07-06','cliente',22,_binary '\0'),(15,'Luigi','Rossi','lulu','lulu3','luigir@gmail.com','1997-09-13','cuoco',0,_binary '\0');
/*!40000 ALTER TABLE `utente` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-19 18:10:32
