import java.io.IOException;
import java.nio.file.*;
import java.util.stream.Stream;

public class KnowledgeBasePipeline {

    public static void main(String[] args) {
        Path processedDir = Paths.get("knowledge_base/processed");
        Path metadataFile = Paths.get("knowledge_base/metadata.jsonl");

        System.out.println("=== Bắt đầu chạy Knowledge Base Data Pipeline ===");

        try {
            if (Files.exists(metadataFile)) {
                Files.delete(metadataFile);
            }

            if (!Files.exists(processedDir)) {
                System.out.println("Lỗi: Không tìm thấy thư mục " + processedDir);
                return;
            }

            try (Stream<Path> topics = Files.list(processedDir)) {
                topics.filter(Files::isDirectory).forEach(topicPath -> {
                    String topicName = topicPath.getFileName().toString();

                    try (Stream<Path> files = Files.list(topicPath)) {
                        files.filter(p -> p.toString().endsWith(".md")).forEach(filePath -> {
                            String fileName = filePath.getFileName().toString();
                            String docId = fileName.substring(0, fileName.lastIndexOf('.'));
                            String title = docId.replace("_", " ");
                            title = title.substring(0, 1).toUpperCase() + title.substring(1);

                            String jsonRecord = String.format(
                                "{\"doc_id\": \"%s\", \"title\": \"%s\", \"topic\": \"%s\", \"publisher\": \"Kodak/Ilford\", \"file_path\": \"%s\", \"language\": \"en\", \"document_type\": \"technical_guide\"}%n",
                                docId, title, topicName, filePath.toString().replace("\\", "/")
                            );

                            try {
                                Files.writeString(
                                    metadataFile, 
                                    jsonRecord, 
                                    StandardOpenOption.CREATE, 
                                    StandardOpenOption.APPEND
                                );
                                System.out.println("[Xử lý thành công] Chủ đề: " + topicName + " | File: " + fileName);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        });
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
            }

            System.out.println("\n=== TẠO METADATA HOÀN TẤT ===");
            System.out.println("Kết quả được lưu tại: " + metadataFile.toAbsolutePath());

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}