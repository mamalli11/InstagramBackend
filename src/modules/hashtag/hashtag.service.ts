import { Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { EntityName } from "src/common/enums/entity.enum";
import { HashtagEntity } from "./entities/hashtag.entity";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";
import { FilterHashtagsDto } from "./dto/filter.dto";
import { NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable()
export class HashtagService {
	constructor(
		@InjectRepository(HashtagEntity) private hashtagRepository: Repository<HashtagEntity>,
	) {}

	async createHashTag(text: string) {
		const hashtag = this.findHashtags(text);
		if (hashtag) {
			hashtag.map(async (name) => {
				try {
					await this.hashtagRepository.insert({ name });
				} catch (error) {}
			});
		}
		return text.trim();
	}

	async findAll(paginationDto: PaginationDto, filterDto: FilterHashtagsDto) {
		const { limit, page, skip } = paginationSolver(paginationDto);
		let { search } = filterDto;
		let where = "";

		if (search) {
			if (where.length > 0) where += " AND ";
			search = `%${search}%`;
			where += "CONCAT(hashtag.name) ILIKE :search";
		}

		const [hashtag, count] = await this.hashtagRepository
			.createQueryBuilder(EntityName.Hashtag)
			.where(where, { search })
			.skip(skip)
			.take(limit)
			.getManyAndCount();

		return { pagination: paginationGenerator(count, page, limit), hashtag };
	}

	async findOne(id: number) {
		const hashtag = await this.hashtagRepository.findOneBy({ id });
		if (!hashtag) throw new NotFoundException(NotFoundMessage.NotFoundHashtag);
		return { message: PublicMessage.Successfuly, hashtag };
	}

	async remove(hashtagId: number) {
		const hashtag = await this.hashtagRepository.findOneBy({ id: hashtagId });
		if (!hashtag) throw new NotFoundException(NotFoundMessage.NotFoundHashtag);
		await this.hashtagRepository.delete({ id: hashtagId });
		return { message: PublicMessage.Deleted };
	}

	findHashtags(text: string): string[] {
		let regex = /#[a-zA-Z0-9ا-ی_]+/g;
		let matches = text.match(regex);
		return matches;
	}
}
