import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  AppSafeAreaView,
  AppText,
  ELEVEN,
  FIFTEEN,
  FOURTEEN,
  MEDIUM,
  NORMAL,
  SEMI_BOLD,
  SIXTEEN,
  THIRTEEN,
  TWELVE,
  TWENTY,
  YELLOW,
  SECOND,
  WHITE,
  TEN,
  BLACK,
  Button,
  BOLD,
  EIGHT,
  THIRD,
} from "../../shared";
import TouchableOpacityView from "../../shared/components/TouchableOpacityView";
import { colors } from "../../theme/colors";
import { folder, add, launchpadImage } from "../../helper/ImageAssets";
import FastImage from "react-native-fast-image";
import moment from "moment";
import { IMAGE_BASE_URL } from "../../helper/Constants";
import NavigationService from "../../navigation/NavigationService";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const Launchpad = () => {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [categorizedProjects, setCategorizedProjects] = useState({
    ongoing: [],
    upcoming: [],
    ended: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [upcomingActiveIndex, setUpcomingActiveIndex] = useState(0);
  const [ongoingActiveIndex, setOngoingActiveIndex] = useState(0);
  const [endedActiveIndex, setEndedActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTimestamp(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLaunchpads = useCallback(async (options = {}) => {
    const { signal } = options;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://159.195.23.93:5001/v1/user/user-launchpad-listing",
        {
          signal,
          headers: {
            Accept: "application/json",
          },
        }
      );
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(
          payload?.message || "Unable to fetch launchpad listings."
        );
      }
      const categorized = categorizeProjects(payload?.data || []);
      if (!signal || !signal.aborted) {
        setCategorizedProjects(categorized);
      }
    } catch (fetchError) {
      if (fetchError?.name !== "AbortError") {
        setError(fetchError?.message || "Something went wrong.");
      }
    } finally {
      if (!signal || !signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchLaunchpads({ signal: controller.signal });

    return () => controller.abort();
  }, [fetchLaunchpads]);

  const ongoingProject = categorizedProjects.ongoing;
  const upcomingProject = categorizedProjects.upcoming;
  const endedProject = categorizedProjects.ended;

  // console.log("upcomingProject", upcomingProject);

  const heroProject = ongoingProject || upcomingProject || endedProject;
  const heroTitle = heroProject
    ? `${heroProject.tokenName ?? ""} (${heroProject.tokenSymbol ?? ""})`
    : "All Launchpad Crypto Platforms Rated By CoinLaunch Score";
  const heroSubtitle =
    heroProject?.description ||
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const heroImageSource = useMemo(() => {
    if (heroProject?.bannerImage) {
      return {
        uri: `${IMAGE_BASE_URL}${heroProject.bannerImage}`,
        priority: FastImage.priority.high,
      };
    }
    return launchpadImage;
  }, [heroProject]);

  const renderOngoingCard = (project) => {
    if (!project) {
      return (
        <View style={styles.emptyStateCard}>
          <AppText type={FOURTEEN} color={SECOND}>
            No ongoing projects available right now.
          </AppText>
        </View>
      );
    }

    const countdownLabel = getCountdownLabel(project, timestamp);
    const bannerSource = project?.bannerImage
      ? {
          uri: `${IMAGE_BASE_URL}${project.bannerImage}`,
          priority: FastImage.priority.high,
        }
      : null;

    const headline =
      project?.headline ||
      project?.description?.split(".")?.[0] ||
      `${project?.tokenName ?? ""} Launchpad`;

    const subHeadline =
      project?.subHeadline ||
      project?.description?.replace(headline, "").trim() ||
      `Participate with ${
        project?.tokenSymbol ?? project?.tokenName ?? "token"
      }`;

    const tokenLogoSource = project?.logoUrl
      ? {
          uri: `${IMAGE_BASE_URL}${project.logoUrl}`,
          priority: FastImage.priority.normal,
        }
      : null;

    const totalRaised = formatRaised(project);
    const totalSale = formatNumber(project?.tokensForSale);
    const tokenPrice = formatTokenPrice(
      project?.tokenPrice,
      project?.tokenSymbol
    );

    return (
      <View style={styles.ongoingCard}>
        <View style={styles.ongoingTop}>
          {bannerSource ? (
            <FastImage
              source={bannerSource}
              resizeMode={FastImage.resizeMode.cover}
              style={styles.ongoingBanner}
            />
          ) : null}
          {countdownLabel ? (
            <LinearGradient
              style={styles.ongoingTimer}
              colors={["#FEBA00", "#F9DC8E", "#FEBA00"]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <AppText
                type={TWELVE}
                weight={SEMI_BOLD}
                style={styles.ongoingTimerText}
              >
                {countdownLabel}
              </AppText>
            </LinearGradient>
          ) : null}
          <View style={styles.ongoingTopContent}>
            <AppText weight={SEMI_BOLD} style={styles.ongoingHeadline}>
              {headline}
            </AppText>
            <View style={styles.ongoingBadgeContainer}>
              <FastImage
                source={tokenLogoSource}
                resizeMode={FastImage.resizeMode.cover}
                style={styles.ongoingBadgeImage}
              />
            </View>
          </View>
        </View>
        <LinearGradient
          colors={["#FFFFFF00", "#FEBA00", "#FFFFFF00"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.ongoingBadgeGlow}
        />
        <View style={styles.ongoingBottom}>
          <View style={styles.ongoingTokenRow}>
            <View style={styles.ongoingTokenIcon}>
              {tokenLogoSource ? (
                <FastImage
                  source={tokenLogoSource}
                  resizeMode={FastImage.resizeMode.cover}
                  style={styles.tokenLogo}
                />
              ) : (
                <AppText type={SIXTEEN} weight={SEMI_BOLD} color={WHITE}>
                  {(project?.tokenSymbol || project?.tokenName || "?")
                    ?.toString()
                    .charAt(0)}
                </AppText>
              )}
            </View>
            <View style={styles.ongoingTokenMeta}>
              <AppText type={SIXTEEN} weight={SEMI_BOLD} color={BLACK}>
                {project?.tokenSymbol}
              </AppText>
            </View>
          </View>

          <View style={styles.ongoingStats}>
            <View style={styles.ongoingStatRow}>
              <AppText type={TEN} color={SECOND}>
                Total Raised
              </AppText>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {totalRaised}
              </AppText>
            </View>
            <View style={styles.ongoingStatRow}>
              <AppText type={TEN} color={SECOND}>
                Token Price
              </AppText>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {tokenPrice}
              </AppText>
            </View>
            <View style={styles.ongoingStatRow}>
              <AppText type={TEN} color={SECOND}>
                Token Sale
              </AppText>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {totalSale}
              </AppText>
            </View>
          </View>

          <Button
            children="Trade"
            containerStyle={styles.ongoingCTA}
            onPress={() => {}}
          />
        </View>
      </View>
    );
  };

  const renderUpcomingCard = (project) => {
    if (!project) {
      return renderEmptyState("upcoming");
    }

    const bannerSource = project?.bannerImage
      ? {
          uri: `${IMAGE_BASE_URL}${project.bannerImage}`,
          priority: FastImage.priority.high,
        }
      : null;

    const listingDate = project?.startTime
      ? formatListing(project.startTime)
      : "--";

    const tokenLogoSource = project?.logoUrl
      ? {
          uri: `${IMAGE_BASE_URL}${project.logoUrl}`,
          priority: FastImage.priority.normal,
        }
      : null;

    return (
      <View style={styles.upcomingCard}>
        <LinearGradient
          colors={["#FEE28A", "#F4B91E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upcomingTop}
        >
          {bannerSource ? (
            <FastImage
              source={bannerSource}
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.upcomingBannerImage}
            />
          ) : tokenLogoSource ? (
            <FastImage
              source={tokenLogoSource}
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.upcomingBannerImage}
            />
          ) : (
            <View style={styles.upcomingBannerPlaceholder} />
          )}
        </LinearGradient>

        <View style={styles.upcomingBottom}>
          <View style={styles.ongoingTokenRow}>
            <View style={styles.ongoingTokenIcon}>
              {tokenLogoSource ? (
                <FastImage
                  source={tokenLogoSource}
                  resizeMode={FastImage.resizeMode.cover}
                  style={styles.tokenLogo}
                />
              ) : (
                <AppText type={SIXTEEN} weight={SEMI_BOLD} color={BLACK}>
                  {(project?.tokenSymbol || project?.tokenName || "?")
                    ?.toString()
                    .charAt(0)}
                </AppText>
              )}
            </View>
            <View style={styles.ongoingTokenMeta}>
              <AppText type={SIXTEEN} weight={SEMI_BOLD} color={BLACK}>
                {project?.tokenSymbol}
              </AppText>
            </View>
          </View>

          <View style={styles.upcomingStatsBox}>
            <View style={styles.upcomingStatsColumn}>
              <AppText type={TEN} style={{ color: colors.whiteShadow }}>
                Total Raised
              </AppText>
              <AppText type={TEN} style={{ color: colors.whiteShadow }}>
                Token Price
              </AppText>
              <AppText type={TEN} style={{ color: colors.whiteShadow }}>
                Token Sale
              </AppText>
            </View>
            <View style={styles.upcomingCenterColumn}>
              <View style={styles.upcomingStatusBadge}>
                <AppText type={TWELVE} weight={SEMI_BOLD} color={BLACK}>
                  Upcoming
                </AppText>
              </View>
              <AppText
                type={TWELVE}
                style={{ color: colors.whiteShadow, padding: 2 }}
              >
                Start on: {formatUpcoming(project?.startTime)}
              </AppText>
            </View>
            <View style={styles.upcomingStatsColumnRight}>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {formatRaised(project)}
              </AppText>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {formatTokenPrice(project?.tokenPrice, project?.tokenSymbol)}
              </AppText>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {project?.tokensForSale}
              </AppText>
            </View>
          </View>

          <Button
            children="View"
            containerStyle={styles.ongoingCTA}
            onPress={() =>
              NavigationService.navigate("ProjectDetails", { project })
            }
          />
        </View>
      </View>
    );
  };

  const renderEndedCard = (project) => {
    if (!project) {
      return renderEmptyState("ended");
    }

    const bannerSource = project?.bannerImage
      ? {
          uri: `${IMAGE_BASE_URL}${project.bannerImage}`,
          priority: FastImage.priority.high,
        }
      : null;

    const tokenLogoSource = project?.logoUrl
      ? {
          uri: `${IMAGE_BASE_URL}${project.logoUrl}`,
          priority: FastImage.priority.normal,
        }
      : null;

    return (
      <View style={styles.upcomingCard}>
        <LinearGradient
          colors={["#FEE28A", "#F4B91E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upcomingTop}
        >
          {bannerSource ? (
            <FastImage
              source={bannerSource}
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.upcomingBannerImage}
            />
          ) : tokenLogoSource ? (
            <FastImage
              source={tokenLogoSource}
              resizeMode={FastImage.resizeMode.stretch}
              style={styles.upcomingBannerImage}
            />
          ) : (
            <View style={styles.upcomingBannerPlaceholder} />
          )}
        </LinearGradient>

        <View style={styles.upcomingBottom}>
          <View style={styles.ongoingTokenRow}>
            <View style={styles.ongoingTokenIcon}>
              {tokenLogoSource ? (
                <FastImage
                  source={tokenLogoSource}
                  resizeMode={FastImage.resizeMode.cover}
                  style={styles.tokenLogo}
                />
              ) : (
                <AppText type={SIXTEEN} weight={SEMI_BOLD} color={BLACK}>
                  {(project?.tokenSymbol || project?.tokenName || "?")
                    ?.toString()
                    .charAt(0)}
                </AppText>
              )}
            </View>
            <View style={styles.ongoingTokenMeta}>
              <AppText type={SIXTEEN} weight={SEMI_BOLD} color={BLACK}>
                {project?.tokenSymbol}
              </AppText>
            </View>
          </View>

          <View style={styles.upcomingStatsBox}>
            <View style={styles.upcomingStatsColumn}>
              <AppText type={TEN} style={{ color: colors.whiteShadow }}>
                Total Raised
              </AppText>
              <AppText type={TEN} style={{ color: colors.whiteShadow }}>
                Token Price
              </AppText>
              <AppText type={TEN} style={{ color: colors.whiteShadow }}>
                Token Sale
              </AppText>
            </View>
            <View style={styles.endedCenterColumn}>
              <View style={styles.endedStatusBadge}>
                <AppText type={TWELVE} weight={SEMI_BOLD} color={BLACK}>
                  Ended
                </AppText>
              </View>
              {/* <AppText
                type={TWELVE}
                style={{ color: colors.whiteShadow, padding: 2 }}
              >
                Trading: {formatUpcoming(project?.endTime)}
              </AppText> */}
            </View>
            <View style={styles.upcomingStatsColumnRight}>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {formatRaised(project)}
              </AppText>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {formatTokenPrice(project?.tokenPrice, project?.tokenSymbol)}
              </AppText>
              <AppText type={TEN} weight={SEMI_BOLD} color={BLACK}>
                {project?.tokensForSale}
              </AppText>
            </View>
          </View>

          <Button
            children="View"
            containerStyle={styles.ongoingCTA}
            onPress={() =>
              NavigationService.navigate("ProjectDetails", { project })
            }
          />
        </View>
      </View>
    );
  };

  const renderProjectCard = (project, variant) => {
    if (!project) {
      return (
        <View style={styles.emptyStateCard}>
          <AppText type={FOURTEEN} color={SECOND}>
            No {variant} projects available right now.
          </AppText>
        </View>
      );
    }

    if (variant === "ongoing") {
      return renderOngoingCard(project);
    }
    if (variant === "upcoming") {
      return renderUpcomingCard(project);
    }
    if (variant === "ended") {
      return renderEndedCard(project);
    }

    const gradientColors = {
      ongoing: ["#1B1206", "#120B05"],
      upcoming: ["#2E1F02", "#140E03"],
      ended: ["#23160B", "#120805"],
    }[variant];

    const tokenLogoSource = project?.logoUrl
      ? {
          uri: `${IMAGE_BASE_URL}${project.logoUrl}`,
          priority: FastImage.priority.normal,
        }
      : null;

    const countdownLabel =
      variant === "ongoing" ? getCountdownLabel(project, timestamp) : null;

    const statusLabel =
      project?.status?.toUpperCase?.() ||
      (variant === "ongoing"
        ? "LIVE"
        : variant === "upcoming"
        ? "UPCOMING"
        : "ENDED");

    const statusStyle =
      variant === "ended"
        ? styles.statusEndedBadge
        : variant === "upcoming"
        ? styles.statusUpcomingBadge
        : styles.statusLiveBadge;

    const metaRows = getMetaRows(project, variant);
    const bannerSource = project?.bannerImage
      ? {
          uri: `${IMAGE_BASE_URL}${project.bannerImage}`,
          priority: FastImage.priority.normal,
        }
      : null;
    const subtitleText =
      variant === "upcoming"
        ? `New Listing • ${formatListing(project?.startTime)}`
        : variant === "ended"
        ? `Trading: ${formatTrading(project?.endTime)}`
        : project?.description || "—";
    const ctaLabel =
      variant === "ongoing"
        ? "Trade"
        : variant === "upcoming"
        ? "View"
        : "View";

    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.projectCard}
      >
        {bannerSource ? (
          <FastImage
            source={bannerSource}
            resizeMode={FastImage.resizeMode.cover}
            style={styles.projectBanner}
          />
        ) : null}
        <View style={styles.projectBody}>
          {countdownLabel ? (
            <LinearGradient
              style={styles.countdownPill}
              colors={["#FEBA00", "#F9DC8E", "#FEBA00"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 1 }}
            >
              <AppText type={TWELVE} weight={SEMI_BOLD} color={WHITE}>
                {countdownLabel}
              </AppText>
            </LinearGradient>
          ) : null}
          <AppText type={TWENTY} weight={SEMI_BOLD} style={styles.projectTitle}>
            {project?.tokenName}
          </AppText>
          <AppText
            type={FOURTEEN}
            weight={NORMAL}
            color={SECOND}
            style={styles.projectSubtitle}
            numberOfLines={2}
          >
            {subtitleText}
          </AppText>
          <View style={styles.tokenRow}>
            <View style={styles.tokenIcon}>
              {tokenLogoSource ? (
                <FastImage
                  source={tokenLogoSource}
                  style={styles.tokenLogo}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <AppText type={FIFTEEN} weight={SEMI_BOLD} color={WHITE}>
                  {(project?.tokenSymbol || project?.tokenName || "?")
                    ?.toString()
                    .charAt(0)}
                </AppText>
              )}
            </View>
            <View style={styles.tokenMeta}>
              <AppText type={SIXTEEN} weight={SEMI_BOLD} color={WHITE}>
                {project?.tokenSymbol}
              </AppText>
              <AppText type={TWELVE} weight={NORMAL} color={SECOND}>
                {project?.network || "Network"}
              </AppText>
            </View>
            <View style={[styles.statusBadgeBase, statusStyle]}>
              <AppText type={ELEVEN} weight={SEMI_BOLD} color={WHITE}>
                {statusLabel}
              </AppText>
            </View>
          </View>
          <View style={styles.detailsSection}>
            {metaRows.map((row) => (
              <View style={styles.detailRow} key={row.label}>
                <AppText type={ELEVEN} color={SECOND}>
                  {row.label}
                </AppText>
                <AppText type={ELEVEN} weight={SEMI_BOLD} color={WHITE}>
                  {row.value}
                </AppText>
              </View>
            ))}
          </View>
          <TouchableOpacityView
            style={styles.projectPrimaryButton}
            onPress={() =>
              NavigationService.navigate("ProjectDetails", { project })
            }
          >
            <AppText type={FOURTEEN} weight={SEMI_BOLD} color={WHITE}>
              {ctaLabel}
            </AppText>
          </TouchableOpacityView>
        </View>
      </LinearGradient>
    );
  };

  const renderSection = (title, variant, data) => (
    <>
      {renderSectionHeader(title, data.length, variant)}
      {renderProjectCard(data[0], variant)}
      {renderSliderDots({ total: data.length })}
    </>
  );

  const renderOngoingSection = (title, data) => {
    const hasMultipleItems = Array.isArray(data) && data.length > 1;

    if (!hasMultipleItems) {
      // Single item or empty - render normally
      return renderSection(title, "ongoing", data);
    }

    // Multiple items - render as slider
    return (
      <>
        {renderSectionHeader(title, data.length, "ongoing")}
        <View style={styles.upcomingCarouselContainer}>
          <Carousel
            width={width}
            height={400}
            data={data}
            renderItem={({ item, index }) => (
              <View style={styles.upcomingCardWrapper}>
                {renderOngoingCard(item)}
              </View>
            )}
            onSnapToItem={(index) => {
              setOngoingActiveIndex(index);
            }}
            autoPlay={false}
            pagingEnabled={true}
            loop={false}
            scrollAnimationDuration={300}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
          />
        </View>
        {renderSliderDots({
          activeIndex: ongoingActiveIndex,
          total: data.length,
        })}
      </>
    );
  };

  const renderUpcomingSection = (title, data) => {
    const hasMultipleItems = Array.isArray(data) && data.length > 1;

    if (!hasMultipleItems) {
      // Single item or empty - render normally
      return renderSection(title, "upcoming", data);
    }

    // Multiple items - render as slider
    return (
      <>
        {renderSectionHeader(title, data.length, "upcoming")}
        <View style={styles.upcomingCarouselContainer}>
          <Carousel
            width={width}
            height={400}
            data={data}
            renderItem={({ item, index }) => (
              <View style={styles.upcomingCardWrapper}>
                {renderUpcomingCard(item)}
              </View>
            )}
            onSnapToItem={(index) => {
              setUpcomingActiveIndex(index);
            }}
            autoPlay={false}
            pagingEnabled={true}
            loop={false}
            scrollAnimationDuration={300}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
          />
        </View>
        {renderSliderDots({
          activeIndex: upcomingActiveIndex,
          total: data.length,
        })}
      </>
    );
  };

  const renderEndedSection = (title, data) => {
    const hasMultipleItems = Array.isArray(data) && data.length > 1;

    if (!hasMultipleItems) {
      // Single item or empty - render normally
      return renderSection(title, "ended", data);
    }

    // Multiple items - render as slider
    return (
      <>
        {renderSectionHeader(title, data.length, "ended")}
        <View style={styles.upcomingCarouselContainer}>
          <Carousel
            width={width}
            height={400}
            data={data}
            renderItem={({ item, index }) => (
              <View style={styles.upcomingCardWrapper}>
                {renderEndedCard(item)}
              </View>
            )}
            onSnapToItem={(index) => {
              setEndedActiveIndex(index);
            }}
            autoPlay={false}
            pagingEnabled={true}
            loop={false}
            scrollAnimationDuration={300}
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
          />
        </View>
        {renderSliderDots({
          activeIndex: endedActiveIndex,
          total: data.length,
        })}
      </>
    );
  };

  return (
    <AppSafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroGradient}>
            <View style={styles.heroTextContainer}>
              <AppText
                type={SIXTEEN}
                weight={SEMI_BOLD}
                style={styles.heroTitle}
              >
                Discover and compare the world’s top crypto launchpad platforms.
              </AppText>
              <AppText
                type={TEN}
                color={SECOND}
                weight={NORMAL}
                style={styles.heroSubtitle}
              >
                Find the best place to participate in early-stage token sales,
                evaluate project credibility, and make informed investment
                decisions. CoinLaunch helps you explore, analyze, and choose the
                most promising crypto launchpads with transparent insights and
                data-driven ratings.
              </AppText>
            </View>
            <View style={styles.heroArtContainer}>
              <FastImage
                source={launchpadImage}
                resizeMode="cover"
                style={{ width: "100%", height: 100 }}
              />
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.stateWrapper}>
            <ActivityIndicator color={colors.buttonBg} />
            <AppText type={THIRTEEN} color={SECOND} style={styles.stateMessage}>
              Fetching launchpad listings...
            </AppText>
          </View>
        ) : error ? (
          <View style={styles.stateWrapper}>
            <AppText type={FOURTEEN} color={SECOND} style={styles.stateMessage}>
              {error}
            </AppText>
            <TouchableOpacityView
              style={styles.retryButton}
              onPress={() => {
                setCategorizedProjects({
                  ongoing: [],
                  upcoming: [],
                  ended: [],
                });
                fetchLaunchpads();
              }}
            >
              <AppText type={TWELVE} weight={SEMI_BOLD} color={WHITE}>
                Retry
              </AppText>
            </TouchableOpacityView>
          </View>
        ) : (
          <>
            {renderOngoingSection(
              "Ongoing Projects",
              categorizedProjects.ongoing
            )}

            {renderUpcomingSection(
              "Upcoming Projects",
              categorizedProjects.upcoming
            )}

            {renderEndedSection("Ended Projects", categorizedProjects.ended)}
          </>
        )}

        {/* <View style={styles.faqSection}>
          <AppText type={TWENTY} weight={SEMI_BOLD} style={styles.sectionTitle}>
            FAQ&apos;S
          </AppText>
          <View style={styles.faqHighlightCard}>
            <AppText
              type={FOURTEEN}
              color={WHITE}
              weight={MEDIUM}
              style={styles.faqHighlightTitle}
            >
              Lorem ipsum is simply dummy text of the
            </AppText>
            <AppText
              type={TWELVE}
              color={SECOND}
              weight={NORMAL}
              style={styles.faqHighlightSubtitle}
            >
              Sales day of service is all online, you will receive an email and
              calendar invite with login before the event.
            </AppText>
            <FastImage
              source={folder}
              resizeMode="contain"
              style={styles.faqHighlightIcon}
            />
          </View>
          <View style={styles.faqList}>
            {faqItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.faqRow,
                  index === faqItems.length - 1 && styles.faqRowLast,
                ]}
              >
                <AppText
                  type={FOURTEEN}
                  weight={NORMAL}
                  color={BLACK}
                  style={styles.faqQuestion}
                  numberOfLines={2}
                >
                  {item.question}
                </AppText>
                <TouchableOpacityView style={styles.faqToggle}>
                  <FastImage
                    source={add}
                    resizeMode="contain"
                    style={styles.faqToggleIcon}
                  />
                </TouchableOpacityView>
              </View>
            ))}
          </View>
        </View> */}
      </ScrollView>
    </AppSafeAreaView>
  );
};

const renderSectionHeader = (title, count, variant) => {
  const getNavigateScreen = () => {
    if (variant === "upcoming") return "AllUpcomingProjects";
    if (variant === "ended") return "AllEndedProjects"; // You can create AllEndedProjects later if needed
    return "AllLiveProjects";
  };

  return (
    <View style={styles.sectionHeader}>
      <AppText type={SIXTEEN} weight={SEMI_BOLD} style={styles.sectionTitle}>
        {title}
      </AppText>
      {count > 0 ? (
        <TouchableOpacityView
          style={styles.viewMore}
          onPress={() => {
            NavigationService.navigate(getNavigateScreen());
          }}
        >
          <AppText type={TEN} color={YELLOW} weight={MEDIUM}>
            View More
          </AppText>
          <View style={styles.viewMoreArrow} />
        </TouchableOpacityView>
      ) : (
        <AppText type={TEN} color={SECOND}>
          No projects
        </AppText>
      )}
    </View>
  );
};

const renderSliderDots = ({ activeIndex = 0, total = 0 }) => {
  if (total <= 1) {
    return null;
  }
  return (
    <View style={styles.sliderDots}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={`dot-${index}`}
          style={[
            styles.sliderDot,
            index === activeIndex && styles.sliderDotActive,
          ]}
        />
      ))}
    </View>
  );
};

const categorizeProjects = (projects) => {
  const categorized = {
    ongoing: [],
    upcoming: [],
    ended: [],
  };

  const now = moment();

  projects.forEach((project) => {
    const status = (project?.status || "").toUpperCase();
    if (status === "ENDED") {
      categorized.ended.push(project);
      return;
    }
    if (status === "LIVE" || status === "ONGOING") {
      categorized.ongoing.push(project);
      return;
    }
    if (status === "UPCOMING") {
      categorized.upcoming.push(project);
      return;
    }

    const start = moment(project?.startTime);
    const end = moment(project?.endTime);

    if (start.isValid() && now.isBefore(start)) {
      categorized.upcoming.push(project);
    } else if (end.isValid() && now.isAfter(end)) {
      categorized.ended.push(project);
    } else {
      categorized.ongoing.push(project);
    }
  });

  return categorized;
};

const getCountdownLabel = (project, timestamp) => {
  if (!project?.endTime) {
    return null;
  }

  const now = moment(timestamp);
  const start = project?.startTime ? moment(project.startTime) : null;
  const end = moment(project.endTime);

  if (start?.isValid() && now.isBefore(start)) {
    const diff = moment.duration(start.diff(now));
    return `Starts in ${formatDuration(diff)}`;
  }

  if (!end.isValid() || now.isSameOrAfter(end)) {
    return null;
  }

  const diff = moment.duration(end.diff(now));
  return `${pad(Math.floor(diff.asHours()))}h ${pad(diff.minutes())}m ${pad(
    diff.seconds()
  )}s`;
};

const getMetaRows = (project, variant) => {
  const rows = [
    {
      label: variant === "upcoming" ? "Total Raised" : "Total Raised",
      value: formatRaised(project),
    },
    {
      label: variant === "upcoming" ? "Highest Increase" : "Highest Increase",
      value: formatPercent(project?.progressPercent),
    },
  ];

  if (variant !== "upcoming" && project?.hardCap) {
    rows.push({
      label: "Hard Cap",
      value: formatNumber(project?.hardCap),
    });
  }

  return rows;
};

const formatNumber = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "--";
  }
  return numericValue.toLocaleString("en-US");
};

const formatPercent = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "--";
  }
  return `${numericValue.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}%`;
};

const formatUpcoming = (value) => {
  if (!value) {
    return "--";
  }
  const date = moment(value);
  if (!date.isValid()) {
    return "--";
  }
  return date.utc().format("DD/MM/YYYY");
};

const formatTrading = (value) => {
  if (!value) {
    return "--";
  }
  const date = moment(value);
  if (!date.isValid()) {
    return "--";
  }
  return date.utc().format("HH:mm MMM DD (UTC)");
};

const formatListing = (value) => {
  if (!value) {
    return "--";
  }
  const date = moment(value);
  if (!date.isValid()) {
    return "--";
  }
  return date.utc().format("YYYY.MM.DD HH:mm (UTC)");
};

const pad = (input) => String(Math.max(0, input)).padStart(2, "0");

const formatDuration = (duration) => {
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
};

const formatRaised = (project) => {
  if (!project) {
    return "--";
  }
  const amount = formatNumber(project.totalRaised);
  if (amount === "--") {
    return "--";
  }
  const symbol = project.raiseCurrency || project.tokenSymbol || "";
  return `${amount} ${symbol}`.trim();
};

const formatTokenPrice = (value, symbol) => {
  if (value === null || value === undefined) {
    return null;
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return null;
  }
  return `${numericValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} ${symbol ?? ""}`.trim();
};

const styles = StyleSheet.create({
  ongoingHeadline: {
    color: "#FFF8D8",
    letterSpacing: 0.3,
    width: "60%",
    textAlign: "left",
  },
  ongoingSubHeadline: {
    lineHeight: 20,
    color: "#F2E3AA",
  },
  ongoingBadgeContainer: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1A1205",
    borderWidth: 1,
    borderColor: "#604210",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  ongoingBadgeImage: {
    width: "100%",
    height: "100%",
  },
  ongoingBadgeGlow: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
  },
  safeArea: {
    backgroundColor: colors.newThemeColor,
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  heroCard: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 10,
  },
  heroGradient: {
    width: "100%",
    borderRadius: 24,
    // paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    // gap: 24,
  },
  heroTextContainer: {
    flex: 1,
    gap: 12,
    width: "65%",
    paddingHorizontal: 10,
  },
  heroTitle: {
    lineHeight: 22,
  },
  heroSubtitle: {
    lineHeight: 15,
  },
  heroArtContainer: {
    width: "30%",
    // backgroundColor: "red",
    // aspectRatio: 1,
    // alignItems: "center",
    // justifyContent: "center",
    // position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 110,
    borderBottomRightRadius: 24,
    borderTopRightRadius: 24,
  },
  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 0,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    color: colors.white,
  },
  viewMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewMoreArrow: {
    width: 6,
    height: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.buttonBg,
    transform: [{ rotate: "-45deg" }],
    marginTop: 2,
  },
  projectCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#302008",
    overflow: "hidden",
  },
  countdownPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 50,
    marginBottom: 12,
  },
  projectTitle: {
    color: colors.white,
    lineHeight: 28,
  },
  projectSubtitle: {
    color: colors.descText,
    lineHeight: 20,
  },
  projectBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },
  tokenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tokenIcon: {
    height: 40,
    width: 40,
    borderRadius: 20,
    borderColor: colors.buttonBg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#33220F",
  },
  tokenMeta: {
    flex: 1,
    gap: 4,
  },
  statusBadgeBase: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  upcomingCard: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#4F3B10",
    overflow: "hidden",
    backgroundColor: colors.themeElevationColor,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  upcomingTop: {
    width: "100%",
    height: 170,
    overflow: "hidden",
  },
  upcomingTopContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upcomingBannerImage: {
    width: "100%",
    height: "100%",
  },
  upcomingBannerPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 214, 94, 0.2)",
  },
  upcomingTopText: {
    flex: 1,
    gap: 8,
  },
  upcomingTokenName: {
    color: "#1B0B01",
    letterSpacing: 0.4,
  },
  upcomingPair: {
    color: "#1B0B01",
  },
  upcomingListingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  upcomingDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  upcomingCoinContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#FFE082",
    backgroundColor: "rgba(255, 214, 94, 0.35)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  upcomingCoinImage: {
    width: "100%",
    height: "100%",
  },
  upcomingCoinPlaceholder: {
    width: "70%",
    height: "70%",
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#FFE082",
  },
  upcomingBottom: {
    backgroundColor: "#111111",
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 18,
  },
  upcomingBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  upcomingLeftColumn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  upcomingLogoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(23,107,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingLogoImage: {
    width: "100%",
    height: "100%",
  },
  upcomingCenterColumn: {
    // alignItems: "center",
    // gap: 10,
    width: "40%",
    height: "75%",
    alignItems: "center",
    // justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#FEBA00",
    borderRadius: 2,
  },
  endedCenterColumn: {
    // alignItems: "center",
    // gap: 10,
    width: "40%",
    height: "40%",
    alignItems: "center",
    // justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#FEBA00",
    borderRadius: 2,
  },
  endedStatusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
    // gap: 2,
    width: "100%",
    // height: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingStatusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    backgroundColor: "#FEBA00",
    alignItems: "center",
    justifyContent: "center",
    // gap: 2,
    width: "100%",
    // height: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingRightColumn: {
    alignItems: "flex-end",
    gap: 6,
  },
  upcomingCTA: {
    marginTop: 4,
    backgroundColor: colors.buttonBg,
    height: 44,
    borderRadius: 18,
  },
  ongoingCard: {
    borderRadius: 9,
    borderColor: "#403013",
    overflow: "hidden",
    backgroundColor: colors.themeElevationColor,
  },
  ongoingTop: {
    height: 170,
    position: "relative",
    justifyContent: "flex-end",
  },
  ongoingBanner: {
    ...StyleSheet.absoluteFillObject,
  },
  ongoingTopOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ongoingTimer: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ongoingTimerText: {
    color: colors.black,
  },
  ongoingTopContent: {
    paddingHorizontal: 24,
    paddingBottom: 26,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ongoingSubHeadline: {
    lineHeight: 20,
  },
  ongoingBottom: {
    backgroundColor: colors.themeElevationColor,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 5,
  },
  ongoingTokenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ongoingTokenIcon: {
    // height: 48,
    // width: 48,
    // borderRadius: 24,
    // borderWidth: 1,
    // borderColor: "#2E2E2E",
    // backgroundColor: "#1D1D1D",
    alignItems: "center",
    justifyContent: "center",
  },
  ongoingTokenMeta: {
    flex: 1,
    gap: 4,
  },
  ongoingStats: {
    gap: 5,
  },
  ongoingStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ongoingCTA: {
    marginTop: 5,
    borderRadius: 4,
    height: 35,
  },
  detailsSection: {
    borderWidth: 1,
    borderColor: "#302008",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: "rgba(27, 18, 6, 0.6)",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectPrimaryButton: {
    marginTop: 18,
    alignSelf: "stretch",
    backgroundColor: colors.buttonBg,
    borderRadius: 30,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sliderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inactiveDot,
  },
  sliderDotActive: {
    width: 22,
    borderRadius: 3,
    backgroundColor: colors.buttonBg,
  },
  faqSection: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  faqHighlightCard: {
    position: "relative",
    backgroundColor: "#1B1B1B",
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
  },
  faqHighlightTitle: {
    marginBottom: 6,
  },
  faqHighlightSubtitle: {
    width: "80%",
    lineHeight: 20,
  },
  faqHighlightIcon: {
    position: "absolute",
    right: 16,
    bottom: 16,
    height: 40,
    width: 40,
    opacity: 0.6,
  },
  faqList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    overflow: "hidden",
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
    backgroundColor: "#121212",
  },
  faqRowLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  faqToggle: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  faqToggleIcon: {
    height: 14,
    width: 14,
    tintColor: colors.black,
  },
  emptyStateCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.themeElevationColor,
  },
  stateWrapper: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
    gap: 12,
  },
  stateMessage: {
    textAlign: "center",
    width: width * 0.8,
  },
  retryButton: {
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tokenLogo: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  statusLiveBadge: {
    backgroundColor: colors.buttonBg,
  },
  statusUpcomingBadge: {
    backgroundColor: "#433415",
  },
  statusEndedBadge: {
    backgroundColor: colors.red,
  },
  projectBanner: {
    width: "100%",
    height: 140,
  },
  upcomingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  upcomingStatsBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  upcomingStatsColumn: {
    gap: 10,
  },
  upcomingStatsColumnRight: {
    alignItems: "flex-end",
    gap: 10,
  },
  upcomingCarouselContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingCardWrapper: {
    width: width - 40,
    alignSelf: "center",
  },
});

export default Launchpad;
